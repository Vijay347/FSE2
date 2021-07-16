import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MdbTableDirective, MdbTablePaginationComponent, ModalDirective } from 'angular-bootstrap-md';
import * as moment from 'moment';
import * as _ from 'lodash';
import { combineLatest, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Company, Stock } from 'src/app/models/company.model';
import { FormalidationService } from 'src/app/services/validators.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

  }

}
