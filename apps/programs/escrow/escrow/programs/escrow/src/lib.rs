use anchor_lang::prelude::*;

declare_id!("Fyy4D9ht44sXxTdwQEUH8DDQg2WuM3zF8sUR6pBVLjaq");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn initiate_transfer(
        ctx: Context<InitiateTransfer>,
        provider_address: Pubkey,
        receiver_address: Pubkey,
        amount: u64,
    ) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.provider = provider_address;
        escrow_account.receiver = receiver_address;
        escrow_account.amount = amount;
        Ok(())
    }

    pub fn revert_transfer(ctx: Context<RevertTransfer>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let provider = &mut ctx.accounts.provider_account;
        let amount = escrow_account.amount;
        **provider.to_account_info().try_borrow_mut_lamports()? += amount;
        escrow_account.amount = 0;
        Ok(())
    }

    pub fn dispense_transfer(
        ctx: Context<DispenseTransfer>,
        treasury_percentage: u8,
    ) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let receiver = &mut ctx.accounts.receiver_account;
        let treasury = &mut ctx.accounts.treasury_account;
        let amount = escrow_account.amount;
        let treasury_amount = (amount as u128)
            .checked_mul(treasury_percentage as u128)
            .unwrap()
            .checked_div(100)
            .unwrap()
            .checked_mul(1000000000)
            .unwrap() as u64;
        **receiver.to_account_info().try_borrow_mut_lamports()? += amount - treasury_amount;
        **treasury.to_account_info().try_borrow_mut_lamports()? += treasury_amount;
        escrow_account.amount = 0;
        Ok(())
    }
}

#[account]
pub struct EscrowAccount {
    provider: Pubkey,
    receiver: Pubkey,
    amount: u64,
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct InitiateTransfer<'info> {
    #[account(init, payers = [provider], space = 8 + 32 + 32 + 8)]
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub provider_account: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevertTransfer<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub provider_account: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct DispenseTransfer<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub receiver_account: SystemAccount<'info>,
    #[account(mut)]
    pub treasury_account: SystemAccount<'info>,
}