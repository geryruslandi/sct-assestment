import { Test, TestingModule } from '@nestjs/testing';
import { BirthdayNotificationService } from '@src/modules/birthday-notification/birthday-notification.service';

describe('BirthdayNotificationService', () => {
  let service: BirthdayNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BirthdayNotificationService],
    }).compile();

    service = module.get<BirthdayNotificationService>(
      BirthdayNotificationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
