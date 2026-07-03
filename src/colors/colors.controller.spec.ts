import { Test } from '@nestjs/testing';
import { ColorsController } from './colors.controller.js';
import { ColorsService } from './colors.service.js';
import { randomUUID } from 'crypto';
import { jest } from '@jest/globals';

describe('ColorController', () => {
  let colorController: ColorsController;
  let colorsService: ColorsService;

  const mockColorService = {
    findAll: jest.fn(),
    createColor: jest.fn(),
    updateColor: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ColorsController],
      providers: [
        {
          provide: ColorsService,
          useValue: mockColorService,
        },
      ],
    }).compile();
    colorController = module.get<ColorsController>(ColorsController);
    colorsService = module.get<ColorsService>(ColorsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all colors', async () => {
      const id = randomUUID();
      const excepted = [{ id, name: 'white', hex: '#FFF' }];
      mockColorService.findAll.mockResolvedValue(excepted);

      const result = await colorController.findAll();
      expect(result).toEqual(excepted);
    });
  });

  describe('create', () => {
    it('should create a color', async () => {
      const id = randomUUID();
      const dto = { name: 'black', hex: '#000' };
      mockColorService.createColor.mockResolvedValue({ id, ...dto });

      const result = await colorController.createColor(dto);
      expect(result).toEqual({ id, name: 'black', hex: '#000' });
      expect(result.name).toEqual('black');
      expect(colorsService.createColor).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a color', async () => {
      const dto = { name: 'blue', hex: '#00ff' };
      const id = randomUUID();

      mockColorService.updateColor.mockResolvedValue({
        id,
        name: 'blue',
        hex: '#00ff',
      });

      const result = await colorController.updateColor(id, dto);
      expect(result).toEqual({ id, ...dto });
      expect(result.name).toEqual('blue');
      expect(result.hex).toEqual('#00ff');
      expect(result.id).toEqual(id);
      expect(colorsService.updateColor).toHaveBeenCalledWith(id, dto);
    });
  });
});
