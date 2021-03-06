import { Component, OnInit } from '@angular/core';
import { Post, BlogService } from '../blog.service';
import { TokenService } from '../token.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Parser, HtmlRenderer } from 'commonmark';

@Component({
    selector: 'app-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {

    private username: string;
    private post: Post;
    private title: string;
    private body: string;
    private readonly base_url = 'http://localhost:3000/'
    
    constructor(
	private blogService: BlogService,
	private tokenService: TokenService,
	private router: Router,
	private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
	if (!document.cookie) {
            let redir = window.location.href;
            console.log("redirect url", redir);
            window.location.replace(`${this.base_url}login?redirect=${redir}`);
        } else {
            this.username = this.tokenService.get_usr(document.cookie);
        }

        this.activatedRoute.paramMap.subscribe(() => {
	    this.getPost()
	});
    }

    getPost(): void {
        this.post = this.blogService.getPost(this.username, Number(this.activatedRoute.snapshot.paramMap.get('id')));
        this.preview_post();
    }

    preview_post() {
        let reader = new Parser();
        let writer = new HtmlRenderer();

        if(this.post) {
            this.title = writer.render(reader.parse(this.post.title));
            this.body = writer.render(reader.parse(this.post.body));
        }
    }

    edit() {
        console.log("back to edit");
        this.router.navigateByUrl("/edit/" + this.post.postid);
    }
    
}
