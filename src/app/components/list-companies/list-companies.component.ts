import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MdbTableDirective, MdbTablePaginationComponent, ModalDirective } from 'angular-bootstrap-md';
import * as moment from 'moment';
import * as _ from 'lodash';
import { combineLatest, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CompanyDetails, Stock } from 'src/app/models/company.model';
import { FormvalidationService } from 'src/app/services/validators.service';
import { CompanyService } from 'src/app/services/company.service';

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
  companyList: Array<CompanyDetails> = [];
  previous: Array<CompanyDetails> = [];
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
  selectedCompany: CompanyDetails = null;

  constructor(private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private formValidatorService: FormvalidationService,
    private companyService: CompanyService) {

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
      companyId: '8A92746B-77F3-413A-9B46-4F17B7BF7324',
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
      companyId: '8A92746B-77F3-413A-9B46-4F17B7BF7324',
      companyName: 'CTS',
      price: 50000.003499,
      date: moment().subtract(100, 'days'),
      time: moment().subtract(100, 'days')
    },
    {
      id: 5,
      companyId: '8A92746B-77F3-413A-9B46-4F17B7BF7324',
      companyName: 'CTS',
      price: 20000.003499,
      date: moment().subtract(120, 'days'),
      time: moment().subtract(120, 'days')
    }];

    this.companyService.getAllCompanies().subscribe((companies: CompanyDetails[]) => {
      this.companyList = companies || [];
      // dummy to be removed
      this.companyList.forEach((x: CompanyDetails) => {
        let stocks = dummyStockDetails.filter(y => y.companyId.toString().toLowerCase() == x.id);
        x.stockDetails = stocks || [];
      });
      //this.companyCodes = this.companyList.length > 0 ? _.map(this.companyList, (o) => { return o.code }) : [];

      this.mdbTable.setDataSource(this.companyList);
      this.companyList = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
    });
  }

  private createFormsAndEvents() {

    this.addCompanyForm = this.fb.group({
      companyCode: new FormControl(null, { validators: Validators.compose([Validators.required, Validators.maxLength(20)]), asyncValidators: [this.formValidatorService.validateCompanyCode()], updateOn: 'blur' }),
      companyName: new FormControl(null, { validators: Validators.compose([Validators.required, Validators.maxLength(100)]) }),
      companyCEO: new FormControl(null, { validators: Validators.compose([Validators.required, Validators.maxLength(100)]) }),
      companyTurnover: new FormControl(null, { validators: Validators.compose([Validators.required, this.formValidatorService.companyTurnoverValidator()]) }),
      companyWebsite: new FormControl(null, { validators: Validators.compose([Validators.required, Validators.maxLength(100)]) }),
      companyStockExchange: new FormControl(null, { validators: Validators.compose([Validators.required, Validators.maxLength(50)]) })
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

  getLatestStockPriceOfCompany(company: CompanyDetails) {
    return company?.stockDetails?.length > 0 ? _.first(_.orderBy(company.stockDetails, ['date', 'time'], ['desc', 'desc']))?.price : 0;
  }

  addStockDetail(company: CompanyDetails) {
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
      const compDet: CompanyDetails = {
        name: this.addCompanyForm.value.companyName,
        code: this.addCompanyForm.value.companyCode,
        ceo: this.addCompanyForm.value.companyCEO,
        turnover: parseFloat(this.addCompanyForm.value.companyTurnover),
        website: this.addCompanyForm.value.companyWebsite,
        stockExchange: this.addCompanyForm.value.companyStockExchange
      };
      this.companyService.addCompany(compDet).subscribe((res: CompanyDetails) => {
        if (res) {
          this.companyList.push(res);
        }
        this.addCompanyForm.reset();
        this.addCompanyModal.hide();
        this.cdRef.detectChanges();
      });
    }
    return;
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
    this.companyService.deleteCompany(id).subscribe((res: any) => {
      if (res) {
        this.companyList.splice(id, 1);
      }
    });
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
