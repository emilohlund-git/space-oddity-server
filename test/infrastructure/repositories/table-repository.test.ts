import Table from '../../../src/domain/entities/Table';
import { TableRepository } from '../../../src/domain/repositories/table-repository.interface';
import { InMemoryTableRepository } from '../../../src/infrastructure/repositories/in-memory-table.repository';

describe('TableRepository', () => {
  let tableRepository: TableRepository;

  beforeAll(() => {
    tableRepository = new InMemoryTableRepository();
  });

  test('should add a table to the repository and then clear', (done) => {
    expect(tableRepository.findAll().length).toBe(0);
    const table = new Table();
    tableRepository.save(table);
    expect(tableRepository.findAll().length).toBe(1);
    tableRepository.clear();
    expect(tableRepository.findAll().length).toBe(0);
    done();
  });

  test('should find a table by id', (done) => {
    const table = new Table();
    tableRepository.save(table);
    expect(tableRepository.findById(table.id)).toBeDefined();
    done();
  });
});