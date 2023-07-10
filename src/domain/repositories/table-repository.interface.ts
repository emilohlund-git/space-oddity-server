import Table from '../entities/Table';

export interface TableRepository {
  save(table: Table): void;
  findById(id: string): Table | undefined;
  findAll(): Table[];
  clear(): void;
}