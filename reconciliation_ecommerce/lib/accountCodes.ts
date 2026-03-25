/**
 * Chart of Accounts for E-commerce Reconciliation
 * Simple version - only accounts we actually use
 */

export interface AccountDefinition {
  code: string;
  name: string;
  type: 'asset' | 'expense' | 'revenue';
  description: string;
}

export const CHART_OF_ACCOUNTS: Record<string, AccountDefinition> = {
  // Assets - Bank & Clearing
  '1000': {
    code: '1000',
    name: 'Bank Account',
    type: 'asset',
    description: 'Main business bank account'
  },
  '1200': {
    code: '1200',
    name: 'Stripe Clearing Account',
    type: 'asset',
    description: 'Funds in transit from Stripe'
  },
  '1210': {
    code: '1210',
    name: 'Amazon Clearing Account',
    type: 'asset',
    description: 'Funds in transit from Amazon'
  },
  '1220': {
    code: '1220',
    name: 'Shopify Clearing Account',
    type: 'asset',
    description: 'Funds in transit from Shopify'
  }
};

export function getAccount(code: string): AccountDefinition | null {
  return CHART_OF_ACCOUNTS[code] || null;
}

export function getClearingAccountCode(platform: 'stripe' | 'amazon' | 'shopify'): string {
  const mapping = {
    stripe: '1200',
    amazon: '1210',
    shopify: '1220'
  };
  return mapping[platform];
}

