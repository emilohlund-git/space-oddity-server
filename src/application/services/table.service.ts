import { UUID } from 'crypto';
import Table from '../../domain/entities/Table';
import { TableRepository } from '../../domain/repositories/table-repository.interface';

export class TableService {
  private tableRepository: TableRepository;

  constructor(tableRepository: TableRepository) {
    this.tableRepository = tableRepository;
  }

  save(table: Table): void {
    this.tableRepository.save(table);
  }

  findById(tableId: UUID) {
    return this.tableRepository.findById(tableId);
  }

  findAll(): Table[] {
    return this.tableRepository.findAll();
  }
}