import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IProducts {
  id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exist');
    }

    const listProducts = await this.productsRepository.findAllById(products);

    if (!listProducts.length) {
      throw new AppError('Any Products does not exist');
    }

    const ids = listProducts.map(product => product.id);

    const checkDoesNotExistProducts = products.filter(
      product => !ids.includes(product.id),
    );

    if (checkDoesNotExistProducts.length) {
      throw new AppError('Some product does not exist');
    }

    const checkAmountExceededProducts = listProducts.filter(
      (product, index) => product.quantity < products[index].quantity,
    );

    if (checkAmountExceededProducts.length) {
      throw new AppError('Amount exceeded');
    }

    const parsedProducts = listProducts.map((product, index) => ({
      product_id: product.id,
      price: product.price,
      quantity: products[index].quantity,
    }));

    const order = this.ordersRepository.create({
      customer,
      products: parsedProducts,
    });

    const productsNewQuatity = listProducts.map((product, index) => ({
      id: product.id,
      quantity: product.quantity - products[index].quantity,
    }));

    await this.productsRepository.updateQuantity(productsNewQuatity);

    return order;
  }
}

export default CreateOrderService;
