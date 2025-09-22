import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type EditableColumnType = 'text' | 'number' | 'select';

export interface EditableTableColumn {
  key: string;
  label: string;
  type: EditableColumnType;
  required?: boolean;
  widthPx?: number;
  options?: Array<{ value: number | string; label: string }>;
  readonly?: boolean;
}

@Component({
  selector: 'app-editable-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editable-table.component.html',
  styleUrls: ['./editable-table.component.css']
})
export class EditableTableComponent<T extends Record<string, any>> {
  @Input() columns: EditableTableColumn[] = [];
  @Input() rows: T[] = [];
  @Input() addButtonLabel = 'Thêm dòng';
  @Input() removeButtonAria = 'Xóa dòng';

  @Output() rowsChange = new EventEmitter<T[]>();

  addRow(): void {
    const newRow: T = {} as T;
    for (const col of this.columns) {
      (newRow as any)[col.key] = col.type === 'number' ? 0 : '';
    }
    this.rows = [...this.rows, newRow];
    this.rowsChange.emit(this.rows);
  }

  removeRow(index: number): void {
    if (index < 0 || index >= this.rows.length) return;
    this.rows = this.rows.filter((_, i) => i !== index);
    this.rowsChange.emit(this.rows);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onCellChange(_index: number): void {
    // Emit the full rows so parent can react (e.g., compute derived fields)
    this.rowsChange.emit(this.rows);
  }
}


