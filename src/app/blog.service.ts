import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class Post {
    postid: number;
    created: Date;
    modified: Date;
    title: string;
    body: string;
}

export class BlogService {
    /* The property posts works as the “memory cache” of all blog posts.
     * When the application starts running, all blog posts by the user
     * will be retrieved from the underlying storage mechanism and be
     * held here. In addition, any changes to a post will be temporarily
     * held here until they are permanently written to the underlying storage.
     */
    private posts: Post[];
    private user: string;
    private readonly base_url = "http://localhost:3000/";
    private readonly api_url = `${this.base_url}api/`;

    constructor() { }

    fetchPosts(username:string): void {
	console.log("try fetching posts...");
	
	let xhr = new XMLHttpRequest();
	xhr.open("GET", this.api_url+username, false);
	xhr.send();

	if (xhr.status == 200) {
            this.posts = [];
            console.log("response received: ", xhr.responseText);
            let rawPosts = JSON.parse(xhr.responseText);
            for (let i = 0; i < rawPosts.length; i++) {
                let post = {
                    postid: rawPosts[i].postid,
                    created: new Date(rawPosts[i].created),
                    modified: new Date(rawPosts[i].modified),
                    title: rawPosts[i].title,
                    body: rawPosts[i].body
                };
                this.posts.push(post);
            }
            this.posts.sort((x, y) => { return x.postid - y.postid });
        } else {
            console.log("code: ", xhr.status);
        }
    }

    getPosts(username: string): Post[] {
	if (username != this.user) {
	    this.fetchPosts(username);
	}
	console.log("getting posts");
	return this.posts;
    }

    getPost(username: string, id: number): Post {
	if (username != this.user) {
            this.fetchPosts(username);
        }
	console.log(`getting post ${id}`);
	return this.get_post_by_ID(id);  
    }

    /*
     * Create a new post with a new postid, an empty title and body,
     * and the current creation and modification times.
     */
    newPost(username: string): Post {
	if (username != this.user) {
            this.fetchPosts(username);
        }
	console.log("try creating new post...");

	let next_id = this.get_next_id();
	let new_post = {
	    postid: next_id,
	    created: new Date(),
	    modified: new Date(),
	    title: "",
	    body: ""
	};

	let xhr = new XMLHttpRequest();
	let callback_ptr = this;
	let old_len = this.posts.length;
	xhr.onreadystatechange = function() {
	    if(xhr.readyState == XMLHttpRequest.DONE) {
		if (xhr.status != 201) {
		    window.alert("ERROR: failed to create post at the server");
     		    if (callback_ptr.posts.length > old_len) {
			callback_ptr.posts.pop();
		    }
		    if (xhr.status == 401) {
			window.location.replace(`${callback_ptr.base_url}login?redirect=/editor/`);
		    }
		}
	    }
	};

	console.log("sending a POST request to ", `${this.api_url+username}/${next_id}`);
	xhr.open("POST", `${this.api_url+username}/${next_id}`, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify(new_post));
	
	this.posts.push(new_post);
	return new_post;
    }

    updatePost(username: string, post: Post): void {
	if (username != this.user) {
            this.fetchPosts(username);
        }
	console.log("try updating post...");
	
	let t_post = this.getPost(username, post.postid);

	if (t_post) {
	    console.log("target post exists");
	    t_post.title = post.title;
	    t_post.body = post.body;

	    let xhr = new XMLHttpRequest();
	    let callback_ptr = this;
	    xhr.onreadystatechange = function() {
		if(xhr.readyState == XMLHttpRequest.DONE) {
		    if (xhr.status != 200) {
			window.alert("ERROR: failed to update post at the server");
			if (xhr.status == 401) {
			    window.location.replace(`${callback_ptr.base_url}login?redirect=/editor/`);
			} else {
			    console.log(xhr.responseText);
			    window.location.replace(`${callback_ptr.base_url}editor/#/edit/${t_post.postid}`);
			}
		    }
		}
	    };

	    console.log("sending a PUT request to ", `${this.api_url+username}/${post.postid}`);
	    xhr.open("PUT", `${this.api_url+username}/${post.postid}`, true);
	    xhr.setRequestHeader("Content-type", "application/json");
	    xhr.send(JSON.stringify(t_post));
	}
    }

    deletePost(username: string, postid: number): void {
	if (username != this.user) {
            this.fetchPosts(username);
        }
	console.log("try deleting post...");
	let t_post = this.getPost(username, postid);
	
	if (t_post) {
	    console.log("target post exists");

	    let xhr = new XMLHttpRequest();
	    let callback_ptr = this
	    xhr.onreadystatechange = function() {
		if(xhr.readyState == XMLHttpRequest.DONE) {
		    if (xhr.status != 204) {
			window.alert("ERROR: failed to delete post at the server");
			if (xhr.status == 401) {
			    window.location.replace(`${callback_ptr.base_url}login?redirect=/editor/`);
			} else {
			    window.location.replace(`${callback_ptr.base_url}editor/`);
			}
			return;
		    }
		    callback_ptr.posts.splice(callback_ptr.get_post_index(postid), 1);
		}
	    };
	    console.log("sending a DELETE request to ", `${this.api_url+username}/${postid}`);
	    xhr.open("DELETE", `${this.api_url+username}/${postid}`, true);
	    xhr.send();
	}
    }
    
    /** HELPER FUNCTIONS */

    get_post_by_ID(id: number): Post {
	for (let i = 0; i < this.posts.length; i++) {
	    if (this.posts[i].postid == id) {
		return this.posts[i];
	    }
	}
	return null;
    }

    get_next_id(): number {
	let len = this.posts.length;
	return this.posts[len-1].postid + 1;
    }

    get_post_index(id: number): number {
	for (let i = 0; i < this.posts.length; i++) {
	    if (this.posts[i].postid == id) {
		return i;
	    }
	}
	return -1;
    }
}
