import {Injectable, OnInit} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Injectable({ providedIn: 'root'})

export class AppService implements OnInit {

  _phoneLayout  : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  phoneLayout$  : Observable<boolean> = this._phoneLayout.asObservable();

  constructor(
    private breakpoints: BreakpointObserver
  ) {
    this.breakpoints.observe(Breakpoints.XSmall).subscribe((result) => {
      const breakpoints = result.breakpoints;

      console.log(result, 'testing');

      if(breakpoints[Breakpoints.XSmall]) {
        console.log(breakpoints[Breakpoints.XSmall]);
        this._phoneLayout.next(true);
      }
    })
  }

  ngOnInit() {

  }

}
