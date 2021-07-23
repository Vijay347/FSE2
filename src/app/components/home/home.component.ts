import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MdbTableDirective, MdbTablePaginationComponent, ModalDirective } from 'angular-bootstrap-md';
import * as moment from 'moment';
import * as _ from 'lodash';
import { combineLatest, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Company, Stock } from 'src/app/models/company.model';
import { FormvalidationService } from 'src/app/services/validators.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('tableEl', { static: false, read: MdbTableDirective }) mdbTable: MdbTableDirective;
  @ViewChild('stockDetails', { static: false, read: ModalDirective }) viewStockDetModal: ModalDirective;
  @ViewChild('stockTablePgn', { static: false, read: MdbTablePaginationComponent }) stockTablePgn: MdbTablePaginationComponent;
  @ViewChild('stockTableEl', { static: false, read: MdbTableDirective }) stockTableEl: MdbTableDirective;
  @ViewChild('addStock', { static: false, read: ModalDirective }) addStockModal: ModalDirective;

  stockExchangeList: string[] = ['BSE', 'NSE'];
  companyList: Array<Company> = [];
  previous: Array<Company> = [];
  searchText = new FormControl(null, Validators.required);
  selectedCmpStkList: Stock[] = [];
  stockMin: any;
  stockMax: any;
  stockAvg: any;
  stockSubmitted: boolean = false;
  scrollY: boolean = true;
  addStockForm: FormGroup;
  fromDate = new FormControl(null, Validators.required);
  toDate = new FormControl(null, Validators.required);
  selectedCompany: Company[] = [];

  constructor(private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private formValidatorService: FormvalidationService) {

  }
  ngAfterViewInit(): void {
    this.mdbTable.setDataSource([]);
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
  }

  private createFormsAndEvents() {

    this.addStockForm = this.fb.group({
      company: new FormControl(null, Validators.required),
      price: new FormControl(null, { validators: Validators.compose([Validators.required, this.formValidatorService.stockPriceValidator()]) }),
      date: new FormControl(null),
      time: new FormControl(null)
    });

    let filter$ = combineLatest([this.fromDate.valueChanges, this.toDate.valueChanges])
      .pipe(debounceTime(500), switchMap(([from, to]) => { return of({ fromDate: from, toDate: to }) }));

    filter$.subscribe((val: any) => {
      if (val?.fromDate && val?.toDate) {
        let stocklist = this.selectedCompany ? this.selectedCompany[0]?.stockDetails ?? []
          : _.flatMap(this.companyList.map(x => x.stockDetails), (val) => { return val });
        let filteredStocks = _.filter(stocklist, (x: Stock) => { return moment(x.date).isSameOrAfter(moment(val.fromDate), 'date') && moment(x.date).isSameOrBefore(moment(val.toDate), 'date') });
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

  searchCompany() {
    let company = this.companyList.find(x => x.code == this.searchText.value);
    if (company) {
      this.selectedCompany = [company];
      this.mdbTable.setDataSource([this.selectedCompany]);
      this.cdRef.detectChanges();
    }
    else {
      this.selectedCompany = [];
    }
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
    this.cdRef.detectChanges();
  }

  onStockSubmit() {
    this.stockSubmitted = true;
    if (this.addStockForm.valid) {
      console.table(this.addStockForm.value);
    }
  }

  showCompanyAll() {
    this.fromDate.reset(null, { emitEvent: true });
    this.toDate.reset(null, { emitEvent: true });
    let stocklist = this.selectedCompany[0]?.stockDetails;
    let stocklistAll = _.flatMap(stocklist, (val) => { return val });
    stocklistAll = _.orderBy(stocklistAll, ['companyName', 'date', 'time'], ['asc', 'desc', 'desc']);
    this.stockTableEl.setDataSource(stocklistAll);
    this.selectedCmpStkList = this.stockTableEl.getDataSource();
    this.stockMin = _.minBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockMax = _.maxBy(this.selectedCmpStkList, (o) => { return o.price });
    this.stockAvg = _.meanBy(this.selectedCmpStkList, (o) => { return o.price });
    this.cdRef.detectChanges();
  }

  viewCompanyStockDetails(companyId: any) {
    this.viewStockDetModal.show();
    this.cdRef.detectChanges();
    this.selectedCompany = this.companyList.filter(x => x.id == companyId);
    if (this.selectedCompany[0].stockDetails && this.selectedCompany[0].stockDetails.length > 0) {
      let stocklistAll = _.flatMap(this.selectedCompany[0].stockDetails, (val) => { return val });
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
}
