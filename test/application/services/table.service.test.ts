import { TableService } from '../../../src/application/services/table.service';
import Table from '../../../src/domain/entities/Table';
import { TableRepository } from '../../../src/domain/repositories/table-repository.interface';
import { InMemoryTableRepository } from '../../../src/infrastructure/repositories/in-memory-table.repository';

describe('TableService', () => {
  let tableRepository: TableRepository;
  let tableService: TableService;

  beforeAll(() => {
    tableRepository = new InMemoryTableRepository();
    tableService = new TableService(tableRepository);
  });

  describe('findAll', () => {
    test('Should return a list of all tables', (done) => {
      let tables = tableService.findAll();

      expect(tables).toHaveLength(0);

      const table = new Table();

      tableService.save(table);

      tables = tableService.findAll();

      expect(tables).toHaveLength(1);

      done();
    });
  });
});