import { Component, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.scss']
})
export class ListCompaniesComponent implements OnInit {

  editField: string;
  stockExchangeList: string[] = ['BSE', 'NSE'];
  companyList: Array<Company> = [
    { id: 1, name: 'Cognizant', code: 'CTS', turnover: '1000000001', website:'http://www.cognizant.com', stockExchange: 'NSE' },
    { id: 2, name: 'TCS', code: 'TCS', turnover: '1000000001', website:'http://www.tcs.com', stockExchange: 'NSE' },
    { id: 3, name: 'Wipro', code: 'WIPRO', turnover: '1000000001', website:'http://www.wipro.com', stockExchange: 'BSE' },
  ];

  ngOnInit(): void {
   
  }

  updateList(id: number, property: string, event: any) {
    const editField = event.target.textContent;
    this.companyList[id][property] = editField;
  }

  remove(id: any) {
    this.companyList.splice(id, 1);
  }

  add() {
    
  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }

}
