import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BlogService } from './blog.service';
import { TokenService } from './token.service';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { AppRoutingModule } from './app-routing.module';
import { PreviewComponent } from './preview/preview.component';

@NgModule({
    declarations: [
	AppComponent,
	ListComponent,
	EditComponent,
	PreviewComponent
    ],
    imports: [
	BrowserModule,
	FormsModule,
	AppRoutingModule
    ],
    providers: [
	BlogService,
	TokenService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
