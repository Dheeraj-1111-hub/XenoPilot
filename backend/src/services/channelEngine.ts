import { ICustomer } from '../models/Customer';
import { determineSegment } from './segmentEngine';

export function recommendChannel(customer: ICustomer): { channel: string, action: string } {
  const segment = determineSegment(customer);
  
  if (segment === 'VIP') {
    return { channel: 'WhatsApp', action: 'Premium Concierge Offer' };
  } else if (segment === 'DORMANT') {
    return { channel: 'Email', action: '15% Reactivation Discount' };
  } else if (segment === 'FREQUENT') {
    return { channel: 'Push', action: 'Early Access New Drop' };
  } else {
    return { channel: 'SMS', action: 'Standard Promo Code' };
  }
}
