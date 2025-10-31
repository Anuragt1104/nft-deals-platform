use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::{Creator, DataV2},
        CreateMetadataAccountsV3, Metadata,
    },
    token::{burn, mint_to, transfer, Burn, Mint, MintTo, Token, TokenAccount, Transfer},
};
use mpl_token_metadata::{
    state::{MasterEdition, MetadataAccount},
};

declare_id!("2TfqdC8KVcDgEeN5EEF1GpFnmWTGr7woUiRnPNMoMoLC");

#[program]
pub mod deal_vault {
    use super::*;

    /// Initialize the DealVault platform
    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.total_deals = 0;
        platform.total_merchants = 0;
        platform.platform_fee_basis_points = 250; // 2.5% platform fee
        platform.bump = ctx.bumps.platform;
        
        emit!(PlatformInitialized {
            authority: platform.authority,
            fee_basis_points: platform.platform_fee_basis_points,
        });
        
        Ok(())
    }

    /// Create a new merchant account
    pub fn create_merchant(
        ctx: Context<CreateMerchant>,
        name: String,
        description: String,
        website: Option<String>,
        location: Option<String>,
    ) -> Result<()> {
        require!(name.len() <= 100, DealVaultError::NameTooLong);
        require!(description.len() <= 500, DealVaultError::DescriptionTooLong);
        
        let merchant = &mut ctx.accounts.merchant;
        merchant.authority = ctx.accounts.authority.key();
        merchant.name = name;
        merchant.description = description;
        merchant.website = website;
        merchant.location = location;
        merchant.is_verified = false;
        merchant.total_deals = 0;
        merchant.reputation_score = 50; // Start with neutral score
        merchant.created_at = Clock::get()?.unix_timestamp;
        merchant.bump = ctx.bumps.merchant;

        // Update platform stats
        let platform = &mut ctx.accounts.platform;
        platform.total_merchants += 1;

        emit!(MerchantCreated {
            merchant: merchant.key(),
            authority: merchant.authority,
            name: merchant.name.clone(),
        });

        Ok(())
    }

    /// Create a deal NFT
    pub fn create_deal(
        ctx: Context<CreateDeal>,
        deal_data: DealData,
    ) -> Result<()> {
        require!(deal_data.title.len() <= 100, DealVaultError::TitleTooLong);
        require!(deal_data.description.len() <= 1000, DealVaultError::DescriptionTooLong);
        require!(deal_data.discount_percentage > 0 && deal_data.discount_percentage <= 100, DealVaultError::InvalidDiscount);
        require!(deal_data.max_supply > 0, DealVaultError::InvalidSupply);
        require!(deal_data.expiry_date > Clock::get()?.unix_timestamp, DealVaultError::InvalidExpiryDate);

        let deal = &mut ctx.accounts.deal;
        deal.merchant = ctx.accounts.merchant.key();
        deal.title = deal_data.title.clone();
        deal.description = deal_data.description.clone();
        deal.category = deal_data.category;
        deal.original_price = deal_data.original_price;
        deal.discount_percentage = deal_data.discount_percentage;
        deal.discounted_price = deal_data.original_price - (deal_data.original_price * deal_data.discount_percentage / 100);
        deal.max_supply = deal_data.max_supply;
        deal.current_supply = 0;
        deal.redeemed_count = 0;
        deal.expiry_date = deal_data.expiry_date;
        deal.is_active = true;
        deal.created_at = Clock::get()?.unix_timestamp;
        deal.bump = ctx.bumps.deal;

        // Mint the deal NFT
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.deal_mint.to_account_info(),
                to: ctx.accounts.deal_token_account.to_account_info(),
                authority: ctx.accounts.merchant_authority.to_account_info(),
            },
        );
        
        mint_to(cpi_context, 1)?;

        // Create metadata for the NFT
        let creator = vec![Creator {
            address: ctx.accounts.merchant_authority.key(),
            verified: true,
            share: 100,
        }];

        let metadata = DataV2 {
            name: format!("DealVault: {}", deal_data.title),
            symbol: "DEAL".to_string(),
            uri: deal_data.metadata_uri.clone(),
            seller_fee_basis_points: 0,
            creators: Some(creator),
            collection: None,
            uses: None,
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.deal_mint.to_account_info(),
                mint_authority: ctx.accounts.merchant_authority.to_account_info(),
                update_authority: ctx.accounts.merchant_authority.to_account_info(),
                payer: ctx.accounts.merchant_authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

        create_metadata_accounts_v3(cpi_context, metadata, true, true, None)?;

        // Update merchant and platform stats
        let merchant = &mut ctx.accounts.merchant;
        merchant.total_deals += 1;

        let platform = &mut ctx.accounts.platform;
        platform.total_deals += 1;

        emit!(DealCreated {
            deal: deal.key(),
            merchant: merchant.key(),
            title: deal.title.clone(),
            price: deal.discounted_price,
            max_supply: deal.max_supply,
        });

        Ok(())
    }

    /// Purchase a deal NFT coupon
    pub fn purchase_deal(ctx: Context<PurchaseDeal>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        
        require!(deal.is_active, DealVaultError::DealInactive);
        require!(deal.current_supply < deal.max_supply, DealVaultError::DealSoldOut);
        require!(deal.expiry_date > Clock::get()?.unix_timestamp, DealVaultError::DealExpired);

        // Calculate fees
        let platform_fee = deal.discounted_price * ctx.accounts.platform.platform_fee_basis_points / 10000;
        let merchant_amount = deal.discounted_price - platform_fee;

        // Transfer payment to merchant
        let transfer_to_merchant = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_to_merchant), merchant_amount)?;

        // Transfer platform fee
        let transfer_to_platform = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.platform_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_to_platform), platform_fee)?;

        // Create coupon NFT for buyer
        let coupon = &mut ctx.accounts.coupon;
        coupon.deal = deal.key();
        coupon.owner = ctx.accounts.buyer.key();
        coupon.is_redeemed = false;
        coupon.purchased_at = Clock::get()?.unix_timestamp;
        coupon.purchase_price = deal.discounted_price;
        coupon.bump = ctx.bumps.coupon;

        // Mint coupon NFT to buyer
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.coupon_mint.to_account_info(),
                to: ctx.accounts.buyer_coupon_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        mint_to(cpi_context, 1)?;

        // Update deal supply
        deal.current_supply += 1;

        emit!(DealPurchased {
            deal: deal.key(),
            coupon: coupon.key(),
            buyer: ctx.accounts.buyer.key(),
            price: deal.discounted_price,
        });

        Ok(())
    }

    /// Redeem a coupon NFT
    pub fn redeem_coupon(ctx: Context<RedeemCoupon>) -> Result<()> {
        let coupon = &mut ctx.accounts.coupon;
        let deal = &ctx.accounts.deal;

        require!(!coupon.is_redeemed, DealVaultError::CouponAlreadyRedeemed);
        require!(deal.expiry_date > Clock::get()?.unix_timestamp, DealVaultError::CouponExpired);
        require!(coupon.owner == ctx.accounts.coupon_owner.key(), DealVaultError::InvalidCouponOwner);

        // Mark coupon as redeemed
        coupon.is_redeemed = true;
        coupon.redeemed_at = Some(Clock::get()?.unix_timestamp);

        // Burn the coupon NFT
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.coupon_mint.to_account_info(),
                from: ctx.accounts.coupon_token_account.to_account_info(),
                authority: ctx.accounts.coupon_owner.to_account_info(),
            },
        );
        burn(cpi_context, 1)?;

        // Update deal redemption count
        let deal = &mut ctx.accounts.deal;
        deal.redeemed_count += 1;

        emit!(CouponRedeemed {
            coupon: coupon.key(),
            deal: deal.key(),
            redeemer: ctx.accounts.coupon_owner.key(),
            redeemed_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Transfer coupon ownership (for secondary market)
    pub fn transfer_coupon(ctx: Context<TransferCoupon>) -> Result<()> {
        let coupon = &mut ctx.accounts.coupon;
        
        require!(!coupon.is_redeemed, DealVaultError::CouponAlreadyRedeemed);
        require!(ctx.accounts.deal.expiry_date > Clock::get()?.unix_timestamp, DealVaultError::CouponExpired);

        // Transfer the NFT
        let transfer_cpi = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.from_owner.to_account_info(),
        };
        transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_cpi), 1)?;

        // Update coupon owner
        coupon.owner = ctx.accounts.to_owner.key();

        emit!(CouponTransferred {
            coupon: coupon.key(),
            from: ctx.accounts.from_owner.key(),
            to: ctx.accounts.to_owner.key(),
        });

        Ok(())
    }

    /// Rate a deal (social feature)
    pub fn rate_deal(ctx: Context<RateDeal>, rating: u8, comment: Option<String>) -> Result<()> {
        require!(rating >= 1 && rating <= 5, DealVaultError::InvalidRating);
        if let Some(ref comment_text) = comment {
            require!(comment_text.len() <= 500, DealVaultError::CommentTooLong);
        }

        let review = &mut ctx.accounts.review;
        review.deal = ctx.accounts.deal.key();
        review.reviewer = ctx.accounts.reviewer.key();
        review.rating = rating;
        review.comment = comment;
        review.created_at = Clock::get()?.unix_timestamp;
        review.bump = ctx.bumps.review;

        emit!(DealRated {
            deal: ctx.accounts.deal.key(),
            reviewer: ctx.accounts.reviewer.key(),
            rating,
        });

        Ok(())
    }

    /// Create loyalty badge NFT
    pub fn create_loyalty_badge(
        ctx: Context<CreateLoyaltyBadge>,
        badge_type: LoyaltyBadgeType,
        required_actions: u64,
    ) -> Result<()> {
        let badge = &mut ctx.accounts.loyalty_badge;
        badge.owner = ctx.accounts.owner.key();
        badge.badge_type = badge_type;
        badge.earned_at = Clock::get()?.unix_timestamp;
        badge.actions_completed = required_actions;
        badge.bump = ctx.bumps.loyalty_badge;

        // Mint badge NFT
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.badge_mint.to_account_info(),
                to: ctx.accounts.badge_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        mint_to(cpi_context, 1)?;

        emit!(LoyaltyBadgeEarned {
            badge: badge.key(),
            owner: ctx.accounts.owner.key(),
            badge_type,
        });

        Ok(())
    }
}

// Account Structs
#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = Platform::LEN,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMerchant<'info> {
    #[account(
        init,
        payer = authority,
        space = Merchant::LEN,
        seeds = [b"merchant", authority.key().as_ref()],
        bump
    )]
    pub merchant: Account<'info, Merchant>,
    #[account(mut)]
    pub platform: Account<'info, Platform>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateDeal<'info> {
    #[account(
        init,
        payer = merchant_authority,
        space = Deal::LEN,
        seeds = [b"deal", merchant.key().as_ref(), &merchant.total_deals.to_le_bytes()],
        bump
    )]
    pub deal: Account<'info, Deal>,
    #[account(mut)]
    pub merchant: Account<'info, Merchant>,
    #[account(mut)]
    pub platform: Account<'info, Platform>,
    #[account(
        init,
        payer = merchant_authority,
        mint::decimals = 0,
        mint::authority = merchant_authority,
        mint::freeze_authority = merchant_authority,
    )]
    pub deal_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = merchant_authority,
        associated_token::mint = deal_mint,
        associated_token::authority = merchant_authority,
    )]
    pub deal_token_account: Account<'info, TokenAccount>,
    /// CHECK: Metadata account
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub merchant_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PurchaseDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    #[account()]
    pub platform: Account<'info, Platform>,
    #[account(
        init,
        payer = buyer,
        space = Coupon::LEN,
        seeds = [b"coupon", deal.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub coupon: Account<'info, Coupon>,
    #[account(
        init,
        payer = buyer,
        mint::decimals = 0,
        mint::authority = buyer,
    )]
    pub coupon_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = buyer,
        associated_token::mint = coupon_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_coupon_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub merchant_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub platform_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemCoupon<'info> {
    #[account(mut)]
    pub coupon: Account<'info, Coupon>,
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    #[account(mut)]
    pub coupon_mint: Account<'info, Mint>,
    #[account(mut)]
    pub coupon_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub coupon_owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferCoupon<'info> {
    #[account(mut)]
    pub coupon: Account<'info, Coupon>,
    #[account()]
    pub deal: Account<'info, Deal>,
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    pub from_owner: Signer<'info>,
    /// CHECK: Validated by token transfer
    pub to_owner: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RateDeal<'info> {
    #[account()]
    pub deal: Account<'info, Deal>,
    #[account(
        init,
        payer = reviewer,
        space = Review::LEN,
        seeds = [b"review", deal.key().as_ref(), reviewer.key().as_ref()],
        bump
    )]
    pub review: Account<'info, Review>,
    #[account(mut)]
    pub reviewer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateLoyaltyBadge<'info> {
    #[account(
        init,
        payer = owner,
        space = LoyaltyBadge::LEN,
        seeds = [b"loyalty_badge", owner.key().as_ref()],
        bump
    )]
    pub loyalty_badge: Account<'info, LoyaltyBadge>,
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = owner,
    )]
    pub badge_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = owner,
        associated_token::mint = badge_mint,
        associated_token::authority = owner,
    )]
    pub badge_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// Data Structures
#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub total_deals: u64,
    pub total_merchants: u64,
    pub platform_fee_basis_points: u16,
    pub bump: u8,
}

impl Platform {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 2 + 1;
}

#[account]
pub struct Merchant {
    pub authority: Pubkey,
    pub name: String,
    pub description: String,
    pub website: Option<String>,
    pub location: Option<String>,
    pub is_verified: bool,
    pub total_deals: u64,
    pub reputation_score: u16,
    pub created_at: i64,
    pub bump: u8,
}

impl Merchant {
    pub const LEN: usize = 8 + 32 + (4 + 100) + (4 + 500) + (1 + 4 + 200) + (1 + 4 + 100) + 1 + 8 + 2 + 8 + 1;
}

#[account]
pub struct Deal {
    pub merchant: Pubkey,
    pub title: String,
    pub description: String,
    pub category: DealCategory,
    pub original_price: u64,
    pub discount_percentage: u8,
    pub discounted_price: u64,
    pub max_supply: u64,
    pub current_supply: u64,
    pub redeemed_count: u64,
    pub expiry_date: i64,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl Deal {
    pub const LEN: usize = 8 + 32 + (4 + 100) + (4 + 1000) + 1 + 8 + 1 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 1;
}

#[account]
pub struct Coupon {
    pub deal: Pubkey,
    pub owner: Pubkey,
    pub is_redeemed: bool,
    pub purchased_at: i64,
    pub redeemed_at: Option<i64>,
    pub purchase_price: u64,
    pub bump: u8,
}

impl Coupon {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 8 + (1 + 8) + 8 + 1;
}

#[account]
pub struct Review {
    pub deal: Pubkey,
    pub reviewer: Pubkey,
    pub rating: u8,
    pub comment: Option<String>,
    pub created_at: i64,
    pub bump: u8,
}

impl Review {
    pub const LEN: usize = 8 + 32 + 32 + 1 + (1 + 4 + 500) + 8 + 1;
}

#[account]
pub struct LoyaltyBadge {
    pub owner: Pubkey,
    pub badge_type: LoyaltyBadgeType,
    pub earned_at: i64,
    pub actions_completed: u64,
    pub bump: u8,
}

impl LoyaltyBadge {
    pub const LEN: usize = 8 + 32 + 1 + 8 + 8 + 1;
}

// Custom Types
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DealData {
    pub title: String,
    pub description: String,
    pub category: DealCategory,
    pub original_price: u64,
    pub discount_percentage: u8,
    pub max_supply: u64,
    pub expiry_date: i64,
    pub metadata_uri: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum DealCategory {
    Food,
    Travel,
    Shopping,
    Entertainment,
    Health,
    Beauty,
    Technology,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum LoyaltyBadgeType {
    EarlyAdopter,
    FrequentBuyer,
    SocialInfluencer,
    ReviewExpert,
    Explorer,
}

// Events
#[event]
pub struct PlatformInitialized {
    pub authority: Pubkey,
    pub fee_basis_points: u16,
}

#[event]
pub struct MerchantCreated {
    pub merchant: Pubkey,
    pub authority: Pubkey,
    pub name: String,
}

#[event]
pub struct DealCreated {
    pub deal: Pubkey,
    pub merchant: Pubkey,
    pub title: String,
    pub price: u64,
    pub max_supply: u64,
}

#[event]
pub struct DealPurchased {
    pub deal: Pubkey,
    pub coupon: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
}

#[event]
pub struct CouponRedeemed {
    pub coupon: Pubkey,
    pub deal: Pubkey,
    pub redeemer: Pubkey,
    pub redeemed_at: i64,
}

#[event]
pub struct CouponTransferred {
    pub coupon: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
}

#[event]
pub struct DealRated {
    pub deal: Pubkey,
    pub reviewer: Pubkey,
    pub rating: u8,
}

#[event]
pub struct LoyaltyBadgeEarned {
    pub badge: Pubkey,
    pub owner: Pubkey,
    pub badge_type: LoyaltyBadgeType,
}

// Errors
#[error_code]
pub enum DealVaultError {
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Title is too long")]
    TitleTooLong,
    #[msg("Invalid discount percentage")]
    InvalidDiscount,
    #[msg("Invalid supply amount")]
    InvalidSupply,
    #[msg("Invalid expiry date")]
    InvalidExpiryDate,
    #[msg("Deal is inactive")]
    DealInactive,
    #[msg("Deal is sold out")]
    DealSoldOut,
    #[msg("Deal has expired")]
    DealExpired,
    #[msg("Coupon already redeemed")]
    CouponAlreadyRedeemed,
    #[msg("Coupon has expired")]
    CouponExpired,
    #[msg("Invalid coupon owner")]
    InvalidCouponOwner,
    #[msg("Invalid rating")]
    InvalidRating,
    #[msg("Comment is too long")]
    CommentTooLong,
}
