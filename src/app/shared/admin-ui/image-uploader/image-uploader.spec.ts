import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { UploadsService } from '../../../core/uploads/uploads.service';
import { ImageUploader } from './image-uploader';

describe('ImageUploader', () => {
  let fixture: ComponentFixture<ImageUploader>;
  let uploadFile: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    uploadFile = vi.fn(() =>
      of({ url: 'https://cdn.example/img.jpg', publicId: 'folder/img' }),
    );
    await TestBed.configureTestingModule({
      imports: [ImageUploader],
      providers: [{ provide: UploadsService, useValue: { uploadFile } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploader);
    fixture.componentRef.setInput('folder', 'products');
    fixture.detectChanges();
  });

  it('uploads a dropped image file', () => {
    const emitted: string[] = [];
    fixture.componentInstance.urlChange.subscribe((url) => {
      if (url) emitted.push(url);
    });

    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    const dt = {
      files: [file],
      dropEffect: 'none',
    } as unknown as DataTransfer;
    const event = new Event('drop', { bubbles: true }) as DragEvent;
    Object.defineProperty(event, 'dataTransfer', { value: dt });
    event.preventDefault = () => undefined;
    event.stopPropagation = () => undefined;

    fixture.componentInstance.onDrop(event);
    fixture.detectChanges();

    expect(uploadFile).toHaveBeenCalledWith(file, 'products');
    expect(emitted).toEqual(['https://cdn.example/img.jpg']);
  });

  it('rejects non-image drops', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const dt = { files: [file] } as unknown as DataTransfer;
    const event = new Event('drop', { bubbles: true }) as DragEvent;
    Object.defineProperty(event, 'dataTransfer', { value: dt });
    event.preventDefault = () => undefined;
    event.stopPropagation = () => undefined;

    fixture.componentInstance.onDrop(event);
    fixture.detectChanges();

    expect(uploadFile).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toBe('Solo se permiten imágenes');
  });
});
