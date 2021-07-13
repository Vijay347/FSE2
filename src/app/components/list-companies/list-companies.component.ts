import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MdbTableDirective, MdbTablePaginationComponent, ModalDirective } from 'angular-bootstrap-md';
import * as moment from 'moment';
import * as _ from 'lodash';
import { combineLatest, from, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Company, Stock } from 'src/app/models/company.model';
import { FormalidationService } from 'src/app/services/validators.service';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.scss']
})
export class ListCompaniesComponent implements OnInit, AfterViewInit {

  @ViewChild('companyPagination', { static: true, read: MdbTablePaginationComponent }) mdbTablePagination: MdbTablePaginationComponent;
  @ViewChild('tableEl', { static: true, read: MdbTableDirective }) mdbTable: MdbTableDirective;
  @ViewChild('stockDetails', { static: true, read: ModalDirective }) viewStockDetModal: ModalDirective;
  @ViewChild('stockTablePgn', { static: false, read: MdbTablePaginationComponent }) stockTablePgn: MdbTablePaginationComponent;
  @ViewChild('stockTableEl', { static: false, read: MdbTableDirective }) stockTableEl: MdbTableDirective;
  @ViewChild('addCompany', { static: false, read: ModalDirective }) addCompanyModal: ModalDirective;

  editField: string;
  stockExchangeList: string[] = ['BSE', 'NSE'];
  companyList: Array<Company> = [];
  previous: Array<Company> = [];
  searchText: string = '';
  selectedCompany: Company = null;
  selectedCmpStkList: Stock[] = [];
  selectedCmpStkListAll: Stock[] = [];
  stockMin: any;
  stockMax: any;
  stockAvg: any;
  submitted: boolean = false;
  addCompanyForm: FormGroup;
  fromDate = new FormControl(null, Validators.required);
  toDate = new FormControl(null, Validators.required);

  constructor(private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private formValidatorService: FormalidationService) {

  }
  ngAfterViewInit(): void {
    this.mdbTablePagination.setMaxVisibleItemsNumberTo(5);
    this.mdbTablePagination.calculateFirstItemIndex();
    this.mdbTablePagination.calculateLastItemIndex();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {

    this.addCompanyForm = this.fb.group({
      companyCode: new FormControl(null, Validators.required),
      companyName: new FormControl(null, Validators.required),
      companyCEO: new FormControl(null, Validators.required),
      companyTurnover: new FormControl(null, { validators: Validators.compose([Validators.required, this.formValidatorService.companyTurnoverValidator()]) }),
      companyWebsite: new FormControl(null, Validators.required),
      companyStockExchange: new FormControl(null, Validators.required)
    });

    let filter$ = combineLatest([this.fromDate.valueChanges, this.toDate.valueChanges])
      .pipe(debounceTime(500), switchMap(([from, to]) => { return of({ fromDate: from, toDate: to }) }));

    filter$.subscribe((val: any) => {
      let filteredStocks = this.selectedCompany?.stockDetails.filter(x => moment(x.date).isSameOrAfter(moment(val.fromDate)) && moment(x.date).isSameOrBefore(moment(val.toDate)));
      if (filteredStocks && filteredStocks.length > 0) {
        this.stockTableEl.setDataSource(filteredStocks);
        this.selectedCmpStkList = this.stockTableEl.getDataSource();
        this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
        this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
        this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
        this.cdRef.detectChanges();
      }
    });

    let dummyStockDetails: Stock[] = [{
      id: 1,
      companyId: 1,
      price: 12.0003,
      date: moment(),
      time: moment()
    },
    {
      id: 2,
      companyId: 2,
      price: 120.12345,
      date: moment().subtract(2, 'days'),
      time: moment().subtract(2, 'days')
    },
    {
      id: 3,
      companyId: 3,
      price: 5000.19949,
      date: moment().subtract(20, 'days'),
      time: moment().subtract(20, 'days')
    },
    {
      id: 4,
      companyId: 1,
      price: 50000.003499,
      date: moment().subtract(100, 'days'),
      time: moment().subtract(100, 'days')
    },
    {
      id: 5,
      companyId: 1,
      price: 20000.003499,
      date: moment().subtract(120, 'days'),
      time: moment().subtract(120, 'days')
    }];
    this.companyList = [
      { id: 1, name: 'Cognizant', code: 'CTS', ceo: 'ceo1', turnover: '1000000001', website: 'http://www.cognizant.com', stockExchange: 'NSE', stockDetails: dummyStockDetails.filter(x => x.companyId == 1) },
      { id: 2, name: 'TCS', code: 'TCS', ceo: 'ceo2', turnover: '1000000001', website: 'http://www.tcs.com', stockExchange: 'NSE', stockDetails: dummyStockDetails.filter(x => x.companyId == 2) },
      { id: 3, name: 'Wipro', code: 'WIPRO', ceo: 'ceo3', turnover: '1000000001', website: 'http://www.wipro.com', stockExchange: 'BSE', stockDetails: dummyStockDetails.filter(x => x.companyId == 3) },
    ];

    this.mdbTable.setDataSource(this.companyList);
    this.companyList = this.mdbTable.getDataSource();
    this.previous = this.mdbTable.getDataSource();
  }

  getFormattedDate(val: any): any {
    return val.format('MMMM Do YYYY');
  }

  getFormattedTime(val: any): any {
    return val.format('h:mm:ss a');
  }

  get addCompanyFormControl() {
    return this.addCompanyForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.addCompanyForm.valid) {
      console.table(this.addCompanyForm.value);
    }
  }

  showAll() {
    this.stockTableEl.setDataSource(this.selectedCmpStkListAll);
    this.selectedCmpStkList = this.stockTableEl.getDataSource();
    this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
    this.cdRef.detectChanges();
  }

  viewStockDetails(id: any) {
    let company = this.companyList.find(x => x.id == id);
    this.selectedCompany = company ?? null;
    if (this.selectedCompany && this.selectedCompany?.stockDetails
      && this.selectedCompany?.stockDetails.length > 0) {
      this.viewStockDetModal.show();
      this.cdRef.detectChanges();
      this.stockTableEl.setDataSource(this.selectedCompany?.stockDetails);
      this.selectedCmpStkList = this.stockTableEl.getDataSource();
      this.selectedCmpStkListAll = this.stockTableEl.getDataSource();
      this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
      this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
      this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
      this.stockTablePgn.setMaxVisibleItemsNumberTo(5);
      this.stockTablePgn.calculateFirstItemIndex();
      this.stockTablePgn.calculateLastItemIndex();
    }
  }

  remove(id: any) {
    this.companyList.splice(id, 1);
  }

  add() {

  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }

  searchItems() {
    const prev = this.mdbTable.getDataSource();
    if (!this.searchText) {
      this.mdbTable.setDataSource(this.previous);
      this.companyList = this.mdbTable.getDataSource();
    }
    if (this.searchText) {
      this.companyList = this.mdbTable.searchLocalDataBy(this.searchText);
      this.mdbTable.setDataSource(prev);
    }
  }

}
