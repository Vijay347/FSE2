import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { FormalidationService } from 'src/app/services/validators.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {

  addCompanyForm: FormGroup;

  stockExchangeList: string[] = ['BSE', 'NSE'];

  constructor(private fb: FormBuilder,
    private formValidatorService: FormalidationService) { }

  ngOnInit(): void {
    this.addCompanyForm = this.fb.group({
      companyCode: new FormControl('', Validators.required),
      companyName: new FormControl('', Validators.required),
      companyCEO: new FormControl('', Validators.required),
      companyTurnover: new FormControl(0, Validators.compose([Validators.required, this.formValidatorService.companyTurnoverValidator])),
      companyWebsite: new FormControl('', Validators.required),
      companyStockExchange: new FormControl(null, Validators.required)
    });
  }

}
