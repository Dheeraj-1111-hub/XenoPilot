import { ICustomer } from '../models/Customer';

export function calculateRisk(customer: ICustomer): string {
  let inactiveDays = 0;
  if (customer.lastOrderDate) {
    inactiveDays = Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // If no order date, calculate from createdAt
    inactiveDays = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  if (inactiveDays > 60 && customer.totalSpent > 10000) {
    return 'HIGH';
  } else if (inactiveDays > 30) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}
