import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { FormalidationService } from 'src/app/services/validators.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {

  public submitted: boolean = false;

  public addCompanyForm: FormGroup;

  stockExchangeList: string[] = ['BSE', 'NSE'];

  constructor(private fb: FormBuilder,
    private formValidatorService: FormalidationService) { }

  ngOnInit(): void {
    this.addCompanyForm = this.fb.group({
      companyCode: new FormControl(null, Validators.required),
      companyName: new FormControl(null, Validators.required),
      companyCEO: new FormControl(null, Validators.required),
      companyTurnover: new FormControl(null, { validators: Validators.compose([Validators.required, this.formValidatorService.companyTurnoverValidator()]) }),
      companyWebsite: new FormControl(null, Validators.required),
      companyStockExchange: new FormControl(null, Validators.required)
    });
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

}
