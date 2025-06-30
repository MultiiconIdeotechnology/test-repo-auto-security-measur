/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BookNowDailogComponent } from './book-now-dailog.component';

describe('BookNowDailogComponent', () => {
  let component: BookNowDailogComponent;
  let fixture: ComponentFixture<BookNowDailogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookNowDailogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookNowDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
