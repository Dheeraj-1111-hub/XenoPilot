import { ICustomer } from '../models/Customer';

export function determineSegment(customer: ICustomer): string {
  let inactiveDays = 0;
  if (customer.lastOrderDate) {
    inactiveDays = Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
  } else {
    inactiveDays = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  if (customer.totalSpent > 25000) {
    return 'VIP';
  } else if (customer.totalOrders > 5) {
    return 'FREQUENT';
  } else if (inactiveDays > 60) {
    return 'DORMANT';
  } else {
    return 'REGULAR';
  }
}
