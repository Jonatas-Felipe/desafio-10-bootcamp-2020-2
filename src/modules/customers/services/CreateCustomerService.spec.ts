import AppError from '@shared/errors/AppError';

import FakeCustomersRepository from '../repositories/fakes/FakeCustomersRepository';
import CreateCustomerService from './CreateCustomerService';

let fakeCustomersRepository: FakeCustomersRepository;
let createCustomerService: CreateCustomerService;

describe('CreateCustomer', () => {
  beforeEach(() => {
    fakeCustomersRepository = new FakeCustomersRepository();
    createCustomerService = new CreateCustomerService(fakeCustomersRepository);
  });

  it('Should be able to create a new customer', async () => {
    const user = await createCustomerService.execute({
      name: 'Jonatas Felipe',
      email: 'jonatas@amzmp.com',
    });
    expect(user).toHaveProperty('id');
  });

  it('Should not be able to create a new customer with same email from another', async () => {
    await createCustomerService.execute({
      name: 'Jonatas Felipe',
      email: 'jonatas@amzmp.com',
    });

    await expect(
      createCustomerService.execute({
        name: 'Jonatas Felipe',
        email: 'jonatas@amzmp.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
