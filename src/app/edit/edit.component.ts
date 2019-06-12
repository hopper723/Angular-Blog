import { Component, OnInit, Input } from '@angular/core';
import { Post, BlogService } from '../blog.service';
import { TokenService } from '../token.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HostListener } from '@angular/core';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

    @Input() post: Post;
    private username: string;
    private old_title: string;
    private old_body: string;
    private readonly base_url = 'http://localhost:3000/';
    
    constructor(
	private blogService: BlogService,
	private tokenService: TokenService,
	private router: Router,
	private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
	if (!document.cookie) {
            let redir = window.location.href;
            console.log("redirect url: ", redir);
            window.location.replace(`${this.base_url}login?redirect=${redir}`);
        } else {
            this.username = this.tokenService.get_usr(document.cookie);
        }
	
	this.activatedRoute.paramMap.subscribe(() => {
	    if (this.post) {
		console.log("saving existing post", this.post);
		this.save();
            }
	    
	    this.getPost();
	});
    }

    getPost(): void {
        console.log("getting post...");
        this.post = this.blogService.getPost(this.username, Number(this.activatedRoute.snapshot.paramMap.get('id')));
        if (this.post) {
            this.old_title = this.post.title;
            this.old_body = this.post.body;
        }
    }

    @HostListener('window:beforeunload')
    save(): void {
        if (this.post && (this.old_title != this.post.title || this.old_body != this.post.body)) {
            console.log("saving post...");
            this.blogService.updatePost(this.username, this.post);
            this.old_title = this.post.title;
            this.old_body = this.post.body;
        }
    }

    preview(): void {
        this.save();
        this.router.navigateByUrl("/preview/" + this.post.postid);
    }

    delete(): void {
        this.blogService.deletePost(this.username, this.post.postid);
        this.router.navigate(['/']);
    }

}
