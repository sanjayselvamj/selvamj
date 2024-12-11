
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { Component, OnInit } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { CommonModule } from '@angular/common';
  import { PostService } from '../../services/post.service';
  import { CommentService } from '../../services/command.service';
  // Corrected import name
  import { FormsModule } from '@angular/forms';
  import { MatIconModule } from '@angular/material/icon';
  import { Post, Comment } from '../../models/post.model';
  import { AuthService } from '../../services/auth.service';
  @Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
  })
  export class PostDetailComponent implements OnInit {

  post: Post | null = null; // The post object to be displayed
  comments: Comment[] = []; // Array to hold comments
  newComment: string = ''; // For new comment input
  modalMediaType: string | null = null; // For modal media type
  modalMediaUrl: string | null = null; // For modal media URL
  isModalVisible = false; // Flag to show/hide modal
  showComments = false; // Flag to show/hide comments
  postId: number | null = null; // ID of the post
  isTextExpanded: boolean = false; // Flag to toggle text expansion
  loggedInUser: string | null = null; // Logged-in username
  userId: number | null = null; // User ID of the logged-in user
  isLoading: boolean = false; // Declare isLoading here
  currentUser = { username: '' }; // Updated to retrieve actual user
  loading: boolean = false; // Add this property to manage loading state
  username: string | null = null;
  currentUserId: number | undefined = undefined;
  usernames: { [userId: string]: string } = {};
  users: any[] = [];
  userStats: any[] = [];

  constructor(
  private route: ActivatedRoute,
  private postService: PostService,
  private commentService: CommentService,
  private http: HttpClient,
  private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.username = this.authService.getUsername(); // Retrieve the username
    console.log('Logged-in username:', this.username);

    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.postId = parseInt(postId, 10);
      this.getPostById(this.postId);
      this.loadComments();
    } else {
      console.error('Post ID is not defined in the route parameters');
    }
  }

  // Fetch post by ID
  getPostById(postId: number): void {
  this.loading = true; // Set loading to true before the API call
  this.postService.getPostById(postId).subscribe(
  (post) => {
  this.loading = false;
  if (post) {
  this.post = post;
  console.log('Post loaded:', post);
  } else {
  console.warn('Post not found');
  }
  },
  (error) => {
  this.loading = false; // Ensure loading is set to false even on
  error
  console.error('Error loading post:', error);
  }
  );
  }
  // Load comments for the current post
  loadComments(): void {
    if (this.postId) {
      this.commentService.getComments(this.postId).subscribe(
        (comments) => {
          this.comments = comments.map((comment) => ({
            ...comment,
            username: comment.username || 'Anonymous',
            comment_id: comment.comment_id || new Date().getTime(),
          }));
          console.log('Comments loaded:', this.comments);
        },
        (error) => {
          console.error('Error loading comments:', error);
        }
      );
    }
  }



  // Submit a new comment
  submitComment(): void {
    if (!this.newComment || !this.username) {
      console.error('Comment content or username is not defined');
      return;
    }

    const commentData = {
      post_id: this.postId,
      content: this.newComment,
      username: this.username,
      user_id: this.userId,
    };

    console.log('Submitting comment:', commentData);

    this.isLoading = true;
    this.addComment(commentData).subscribe(
      (response) => {
        console.log('Comment submitted successfully:', response);
        this.newComment = ''; // Clear input
        this.loadComments(); // Reload comments
        this.isLoading = false;
      },
      (error) => {
        console.error('Error submitting comment:', error);
        this.isLoading = false;
      }
    );
  }

  addComment(commentData: any) {
  const headers = new HttpHeaders({
  'Content-Type': 'application/json' // Ensure the request is sent

  });
  return this.http.post('http://localhost:3000/add', commentData, {
  headers });
  }
  deleteComment(commentUsername: string, commentId: number): void {
    console.log('Attempting to delete comment with ID:', commentId);

    // Check if commentId is defined
    if (commentId === undefined) {
      console.error('Comment ID is undefined. Ensure the comment ID is passed correctly.');
      return;
    }

    if (confirm('Are you sure you want to delete this comment?')) {
      this.http.delete(`http://localhost:3000/comments/${commentId}`).subscribe({
        next: (response) => {
          console.log('Comment deleted:', response);
          // Remove the deleted comment from the list
          this.comments = this.comments.filter(comment =>
            comment.id !== commentId); // Use comment.id here
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        }
      });
    }
  }


  // Open media modal
  openModal(mediaType: string, mediaUrl: string): void {
  this.isModalVisible = true;
  this.modalMediaType = mediaType;
  this.modalMediaUrl = mediaUrl;
  }
  // Close media modal
  closeModal(): void {
  this.isModalVisible = false;
  this.modalMediaType = null;
  this.modalMediaUrl = null;
  }
  // Toggle visibility of comments section
  toggleCommentSection(): void {
  this.showComments = !this.showComments;
  }
  // Like or unlike a post
  toggleLike(post: Post): void {
  post.userHasLiked = !post.userHasLiked;
  post.likes = post.userHasLiked ? (post.likes || 0) + 1 : (post.likes
  || 0) - 1;
  }
  // Utility for full URL conversion
  getFullUrl(url: string): string {
  if (url.startsWith('http://localhost:3000')) {
  return url;
  }
  return `http://localhost:3000${url}`;
  }
  // Expand or collapse text
  expandText(): void {
  this.isTextExpanded = !this.isTextExpanded;
  }




  }
