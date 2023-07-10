import { UUID } from 'crypto';
import Table from '../../domain/entities/Table';
import { TableRepository } from '../../domain/repositories/table-repository.interface';

export class InMemoryTableRepository implements TableRepository {
  private tables: Map<UUID, Table>;

  constructor() {
    this.tables = new Map<UUID, Table>();
  }

  save(table: Table): void {
    this.tables.set(table.id, table);
  }

  findById(id: UUID): Table | undefined {
    return this.tables.get(id);
  }

  findAll(): Table[] {
    return Array.from(this.tables.values());
  }

  clear() {
    this.tables = new Map<UUID, Table>();
  }

  // Implement other methods as needed
}