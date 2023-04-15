import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock: Partial<UsersService>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    usersServiceMock = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@example.com',
          password: '123',
        } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: '123' } as User]),
      // remove: () => {},
      // update: () => {},
    };
    authServiceMock = {
      signUp: (email: string, password: string) =>
        Promise.resolve({
          id: 1,
          email,
          password,
        } as User),
      signIn: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@example.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@example.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    usersServiceMock.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signIn updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signIn(
      {
        email: 'user@example.com',
        password: 'password',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
