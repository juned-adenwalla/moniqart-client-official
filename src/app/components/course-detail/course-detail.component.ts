import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaseService } from 'src/app/services/base.service';
import { CartService } from 'src/app/services/cart.service';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent {
  isLoading:any = true;
  paramid: any;
  coursedata: any;
  baseurl:any = environment.baseurl;
  categories: any;
  trainers: any;
  sitedata: any;
  lessons: any;
  currencycode: any;
  products: any;
  p: number = 1;
  constructor(private baseService:BaseService,private route: ActivatedRoute,private cart: CartService) {
    const param = this.route.params.subscribe((res:any)=>{
      this.paramid = res.id
    });
  }
  ngOnInit() {
    this.initFunction();
  }

  initFunction(){
    let header = {
      collection: "tblcourses",
      param: "_id"
    }
    const courses = this.baseService.get(`/api/base/item/${this.paramid}`,header);
    const categories = this.baseService.get('/api/midoffice/list/collection/tblcategories',{filter:"status",value:1});
    const siteconfig = this.baseService.get('/api/midoffice/list/collection/tblsiteconfig',{filter:"_id",value:1});
    const lessons = this.baseService.get('/api/midoffice/list/collection/tbllessons',{filter:"courseid",value:this.paramid});
    forkJoin([courses,categories,siteconfig,lessons]).subscribe((res:any)=>{
      console.log('res:',res)
      if(res[0]["status"]){
        this.coursedata = res[0]["data"][0];
        this.baseService.get('/api/midoffice/list/collection/tblproducts',{filter:"category",value:this.coursedata?.category}).subscribe((res:any)=>{
          if(res["status"]){
            this.products = res["data"];
          }
        });
      }
      if(res[1]["status"]){
        this.categories = res[1]["data"];
      }
      if(res[2]["status"]){
        this.sitedata = res[2]["data"][0];
      }
      if(res[3]["status"]){
        this.lessons = res[3]["data"];
      }
      this.isLoading = false;
    });
  }

  searchCategoryById(idToFind: number): any | undefined {
    // console.log('catid:',idToFind)
    if(idToFind){
      return this.categories.filter((item:any) => item._id == idToFind);
    }
  }

  currencyConversion(amount:any){
    const selectedCurrency:any = localStorage.getItem('currency');
    const obj = JSON.parse(selectedCurrency);
    this.currencycode = obj.name
    console.log(obj.name)
    return obj.value * amount;
  }

  shouldShowLesson(): boolean {
    const now = new Date();
    const startDateString = this.coursedata?.startdate; // Assuming you have "2023-09-05" as the start date format

    // Parse the start date string into a Date object
    const startDateParts = startDateString.split('-'); // Split the string into parts
    const startDate = new Date(
      parseInt(startDateParts[0]), // Year
      parseInt(startDateParts[1]) - 1, // Month (subtract 1 as months are 0-indexed)
      parseInt(startDateParts[2]) // Day
    );

    // Check if startDate is today or later
    const isStartDateTodayOrLater = startDate >= now;

    return isStartDateTodayOrLater;
  }

  addToCart(data:any){
    data['type'] = 'course';
    if(data){
      this.cart.addToCart(data);
    }
  }

}
