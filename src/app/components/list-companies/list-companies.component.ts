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
  @ViewChild('addStock', { static: false, read: ModalDirective }) addStockModal: ModalDirective;

  stockExchangeList: string[] = ['BSE', 'NSE'];
  companyList: Array<Company> = [];
  previous: Array<Company> = [];
  searchText: string = '';
  selectedCmpStkList: Stock[] = [];
  stockMin: any;
  stockMax: any;
  stockAvg: any;
  submitted: boolean = false;
  stockSubmitted: boolean = false;
  showAdditionalDetails: boolean = false;
  scrollY: boolean = true;
  addCompanyForm: FormGroup;
  addStockForm: FormGroup;
  fromDate = new FormControl(null, Validators.required);
  toDate = new FormControl(null, Validators.required);
  stockCmpSelect = new FormControl(null, Validators.required);
  selectedCompany: Company = null;

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
    this.createFormsAndEvents();

    let dummyStockDetails: Stock[] = [{
      id: 1,
      companyId: 1,
      companyName: 'CTS',
      price: 12.0003,
      date: moment(),
      time: moment()
    },
    {
      id: 2,
      companyId: 2,
      companyName: 'TCS',
      price: 120.12345,
      date: moment().subtract(2, 'days'),
      time: moment().subtract(2, 'days')
    },
    {
      id: 3,
      companyId: 3,
      companyName: 'Wipro',
      price: 5000.19949,
      date: moment().subtract(20, 'days'),
      time: moment().subtract(20, 'days')
    },
    {
      id: 4,
      companyId: 1,
      companyName: 'CTS',
      price: 50000.003499,
      date: moment().subtract(100, 'days'),
      time: moment().subtract(100, 'days')
    },
    {
      id: 5,
      companyId: 1,
      companyName: 'CTS',
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

  private createFormsAndEvents() {

    this.addCompanyForm = this.fb.group({
      companyCode: new FormControl(null, { validators: [Validators.required], asyncValidators: [this.formValidatorService.validateCompanyCode()] }),
      companyName: new FormControl(null, Validators.required),
      companyCEO: new FormControl(null, Validators.required),
      companyTurnover: new FormControl(null, { validators: Validators.compose([Validators.required, this.formValidatorService.companyTurnoverValidator()]) }),
      companyWebsite: new FormControl(null, Validators.required),
      companyStockExchange: new FormControl(null, Validators.required)
    });

    this.addStockForm = this.fb.group({
      company: new FormControl(null, Validators.required),
      price: new FormControl(null, { validators: Validators.compose([Validators.required, this.formValidatorService.stockPriceValidator()]) }),
      date: new FormControl(null),
      time: new FormControl(null)
    });

    this.stockCmpSelect.valueChanges.subscribe((companyId: any) => {
      if (companyId) {
        let company = this.companyList.find(x => x.id == companyId);
        if (company && company?.stockDetails
          && company?.stockDetails.length > 0) {
          this.showAdditionalDetails = true;
          let stocks = _.orderBy(company?.stockDetails, ['date', 'time'], ['desc', 'desc']);
          this.stockTableEl.setDataSource(stocks);
          this.selectedCmpStkList = this.stockTableEl.getDataSource();
          this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
          this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
          this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
        }
        else {
          this.stockTableEl.setDataSource([]);
          this.selectedCmpStkList = this.stockTableEl.getDataSource();
          this.stockMin = 0;
          this.stockMax = 0;
          this.stockAvg = 0;
          this.cdRef.detectChanges();
        }
      }
    });

    let filter$ = combineLatest([this.fromDate.valueChanges, this.toDate.valueChanges])
      .pipe(debounceTime(500), switchMap(([from, to]) => { return of({ fromDate: from, toDate: to }) }));

    filter$.subscribe((val: any) => {
      if (val?.fromDate && val?.toDate) {
        let stocklist = this.stockCmpSelect.value ?
          this.companyList.find(x => x.id == this.stockCmpSelect.value)?.stockDetails ?? []
          : this.selectedCompany ? this.selectedCompany?.stockDetails ?? [] 
          : _.flatMap(this.companyList.map(x => x.stockDetails), (val) => { return val });
        let filteredStocks = stocklist.filter(x => moment(x.date).isSameOrAfter(moment(val.fromDate), 'date') && moment(x.date).isSameOrBefore(moment(val.toDate), 'date'));
        if (filteredStocks && filteredStocks.length > 0) {
          filteredStocks = _.orderBy(filteredStocks, ['date', 'time'], ['desc', 'desc']);
          this.stockTableEl.setDataSource(filteredStocks);
          this.selectedCmpStkList = this.stockTableEl.getDataSource();
          this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
          this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
          this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
          this.cdRef.detectChanges();
        }
        else {
          this.stockTableEl.setDataSource([]);
          this.selectedCmpStkList = this.stockTableEl.getDataSource();
          this.stockMin = 0;
          this.stockMax = 0;
          this.stockAvg = 0;
          this.cdRef.detectChanges();
        }
      }
    });
  }

  getFormattedNaN(val: any) {
    return isNaN(val) ? 0 : val;
  }

  getFormattedDate(val: any): any {
    return val.format('MMMM Do YYYY');
  }

  getFormattedTime(val: any): any {
    return val.format('h:mm:ss:SSS a');
  }

  get addCompanyFormControl() {
    return this.addCompanyForm.controls;
  }

  get addStockFormControl() {
    return this.addStockForm.controls;
  }

  getLatestStockPriceOfCompany(company: Company) {
    return company?.stockDetails ? _.first(_.orderBy(company.stockDetails, ['date', 'time'], ['desc', 'desc']))?.price : 0;
  }

  addStockDetail(company: Company) {
    this.addStockModal.show();
    this.addStockForm.reset();
    this.addStockForm.get('company').patchValue(company);
    this.addStockForm.get('company').updateValueAndValidity();
    this.addStockForm.get('date').patchValue(moment().format('YYYY-MM-DD'));
    this.addStockForm.get('date').updateValueAndValidity();
    this.addStockForm.get('time').patchValue(moment().format('h:mm:ss:SSS a'))
    this.addStockForm.get('time').updateValueAndValidity();
    this.addStockForm.updateValueAndValidity();
    this.cdRef.detectChanges();
  }

  stockReset() {
    this.addStockForm.get('price').reset(null);
    this.addStockForm.get('price').updateValueAndValidity();
    this.addStockForm.get('date').reset(moment().format('YYYY-MM-DD'));
    this.addStockForm.get('date').updateValueAndValidity();
    this.addStockForm.get('time').reset(moment().format('h:mm:ss:SSS a'))
    this.addStockForm.get('time').updateValueAndValidity();
    //this.addStockForm.updateValueAndValidity();
    this.cdRef.detectChanges();
  }

  onSubmit() {
    this.submitted = true;
    if (this.addCompanyForm.valid) {
      console.table(this.addCompanyForm.value);
    }
  }

  onStockSubmit() {
    this.stockSubmitted = true;
    if (this.addStockForm.valid) {
      console.table(this.addStockForm.value);
    }
  }

  showAll() {
    this.stockCmpSelect.reset(null, { emitEvent: true });
    this.fromDate.reset(null, { emitEvent: true });
    this.toDate.reset(null, { emitEvent: true });
    this.showAdditionalDetails = false;
    let stocklist = this.companyList.map(x => x.stockDetails);
    let stocklistAll = _.flatMap(stocklist, (val) => { return val });
    stocklistAll = _.orderBy(stocklistAll, ['companyName', 'date', 'time'], ['asc', 'desc', 'desc']);
    this.stockTableEl.setDataSource(stocklistAll);
    this.selectedCmpStkList = this.stockTableEl.getDataSource();
    this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
    this.cdRef.detectChanges();
  }

  showCompanyAll() {
    this.fromDate.reset(null, { emitEvent: true });
    this.toDate.reset(null, { emitEvent: true });
    this.showAdditionalDetails = true;
    let stocklist = this.selectedCompany?.stockDetails;
    let stocklistAll = _.flatMap(stocklist, (val) => { return val });
    stocklistAll = _.orderBy(stocklistAll, ['companyName', 'date', 'time'], ['asc', 'desc', 'desc']);
    this.stockTableEl.setDataSource(stocklistAll);
    this.selectedCmpStkList = this.stockTableEl.getDataSource();
    this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
    this.cdRef.detectChanges();
  }


  viewStockDetails() {
    this.selectedCompany = null;
    this.viewStockDetModal.show();
    this.cdRef.detectChanges();
    let stocklist = this.companyList.map(x => x.stockDetails);
    let stocklistAll = _.flatMap(stocklist, (val) => { return val });
    this.stockTableEl.setDataSource(stocklistAll);
    this.selectedCmpStkList = this.stockTableEl.getDataSource();
    this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockTablePgn.setMaxVisibleItemsNumberTo(5);
    this.stockTablePgn.calculateFirstItemIndex();
    this.stockTablePgn.calculateLastItemIndex();
    this.cdRef.detectChanges();
  }

  viewCompanyStockDetails(companyId: any) {
    this.showAdditionalDetails = true;
    this.viewStockDetModal.show();
    this.cdRef.detectChanges();
    this.selectedCompany = this.companyList.find(x => x.id == companyId);
    if (this.selectedCompany.stockDetails && this.selectedCompany.stockDetails.length > 0) {
      let stocklistAll = _.flatMap(this.selectedCompany.stockDetails, (val) => { return val });
      this.stockTableEl.setDataSource(stocklistAll);
      this.selectedCmpStkList = this.stockTableEl.getDataSource();
      this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
      this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
      this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
      this.stockTablePgn.setMaxVisibleItemsNumberTo(5);
      this.stockTablePgn.calculateFirstItemIndex();
      this.stockTablePgn.calculateLastItemIndex();
      this.cdRef.detectChanges();
    }
  }

  remove(id: any) {
    this.companyList.splice(id, 1);
  }

  add() {
    this.addCompanyForm.reset();
    this.addCompanyModal.show();
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
