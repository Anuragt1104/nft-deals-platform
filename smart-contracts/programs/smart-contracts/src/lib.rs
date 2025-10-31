use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111112");

#[program]
pub mod smart_contracts {
    use super::*;

    pub fn create_deal(
        ctx: Context<CreateDeal>,
        title: String,
        description: String,
        original_price: u64,
        discounted_price: u64,
        discount_percentage: u8,
        category: String,
        expiry_date: i64,
        max_supply: u64,
    ) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        deal.authority = ctx.accounts.authority.key();
        deal.title = title;
        deal.description = description;
        deal.original_price = original_price;
        deal.discounted_price = discounted_price;
        deal.discount_percentage = discount_percentage;
        deal.category = category;
        deal.expiry_date = expiry_date;
        deal.max_supply = max_supply;
        deal.current_supply = 0;
        deal.is_active = true;
        deal.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Deal created: {}", deal.title);
        Ok(())
    }

    pub fn purchase_deal(
        ctx: Context<PurchaseDeal>,
    ) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        
        require!(deal.is_active, DealError::DealNotActive);
        require!(deal.current_supply < deal.max_supply, DealError::DealSoldOut);
        require!(Clock::get()?.unix_timestamp < deal.expiry_date, DealError::DealExpired);

        // Create coupon record
        let coupon = &mut ctx.accounts.coupon;
        coupon.deal_id = deal.key();
        coupon.owner = ctx.accounts.buyer.key();
        coupon.is_redeemed = false;
        coupon.purchase_date = Clock::get()?.unix_timestamp;
        coupon.redemption_code = generate_redemption_code()?;

        // Update deal supply
        deal.current_supply += 1;

        msg!("Deal purchased! Coupon code: {}", coupon.redemption_code);
        
        Ok(())
    }

    pub fn redeem_coupon(
        ctx: Context<RedeemCoupon>,
        redemption_code: String,
    ) -> Result<()> {
        let coupon = &mut ctx.accounts.coupon;
        let deal = &ctx.accounts.deal;
        
        require!(!coupon.is_redeemed, DealError::CouponAlreadyRedeemed);
        require!(coupon.redemption_code == redemption_code, DealError::InvalidRedemptionCode);
        require!(Clock::get()?.unix_timestamp < deal.expiry_date, DealError::DealExpired);

        coupon.is_redeemed = true;
        coupon.redemption_date = Some(Clock::get()?.unix_timestamp);

        msg!("Coupon redeemed successfully!");

        Ok(())
    }

    pub fn create_merchant_profile(
        ctx: Context<CreateMerchantProfile>,
        name: String,
        description: String,
        website: String,
        location: String,
    ) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        merchant.authority = ctx.accounts.authority.key();
        merchant.name = name;
        merchant.description = description;
        merchant.website = website;
        merchant.location = location;
        merchant.is_verified = false;
        merchant.total_deals = 0;
        merchant.total_sales = 0;
        merchant.reputation_score = 0;
        merchant.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Merchant profile created: {}", merchant.name);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateDeal<'info> {
    #[account(
        init,
        payer = authority,
        space = Deal::LEN
    )]
    pub deal: Account<'info, Deal>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    #[account(
        init,
        payer = buyer,
        space = Coupon::LEN
    )]
    pub coupon: Account<'info, Coupon>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemCoupon<'info> {
    #[account(mut)]
    pub coupon: Account<'info, Coupon>,
    pub deal: Account<'info, Deal>,
    pub merchant: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateMerchantProfile<'info> {
    #[account(
        init,
        payer = authority,
        space = Merchant::LEN
    )]
    pub merchant: Account<'info, Merchant>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Deal {
    pub authority: Pubkey,
    pub title: String,
    pub description: String,
    pub original_price: u64,
    pub discounted_price: u64,
    pub discount_percentage: u8,
    pub category: String,
    pub expiry_date: i64,
    pub max_supply: u64,
    pub current_supply: u64,
    pub is_active: bool,
    pub created_at: i64,
}

impl Deal {
    const LEN: usize = 8 + // discriminator
        32 + // authority
        4 + 64 + // title (string)
        4 + 256 + // description (string)
        8 + // original_price
        8 + // discounted_price
        1 + // discount_percentage
        4 + 32 + // category (string)
        8 + // expiry_date
        8 + // max_supply
        8 + // current_supply
        1 + // is_active
        8; // created_at
}

#[account]
pub struct Coupon {
    pub deal_id: Pubkey,
    pub owner: Pubkey,
    pub is_redeemed: bool,
    pub purchase_date: i64,
    pub redemption_date: Option<i64>,
    pub redemption_code: String,
}

impl Coupon {
    const LEN: usize = 8 + // discriminator
        32 + // deal_id
        32 + // owner
        1 + // is_redeemed
        8 + // purchase_date
        1 + 8 + // redemption_date (Option<i64>)
        4 + 32; // redemption_code (string)
}

#[account]
pub struct Merchant {
    pub authority: Pubkey,
    pub name: String,
    pub description: String,
    pub website: String,
    pub location: String,
    pub is_verified: bool,
    pub total_deals: u64,
    pub total_sales: u64,
    pub reputation_score: u64,
    pub created_at: i64,
}

impl Merchant {
    const LEN: usize = 8 + // discriminator
        32 + // authority
        4 + 64 + // name (string)
        4 + 256 + // description (string)
        4 + 128 + // website (string)
        4 + 128 + // location (string)
        1 + // is_verified
        8 + // total_deals
        8 + // total_sales
        8 + // reputation_score
        8; // created_at
}

#[error_code]
pub enum DealError {
    #[msg("Deal is not active")]
    DealNotActive,
    #[msg("Deal is sold out")]
    DealSoldOut,
    #[msg("Deal has expired")]
    DealExpired,
    #[msg("Coupon has already been redeemed")]
    CouponAlreadyRedeemed,
    #[msg("Invalid redemption code")]
    InvalidRedemptionCode,
}

fn generate_redemption_code() -> Result<String> {
    let timestamp = Clock::get()?.unix_timestamp;
    Ok(format!("DEAL{}", timestamp % 1000000))
}