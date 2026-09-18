package com.example.exp5.controller;

import com.example.exp5.dto.ApiResponse;
import com.example.exp5.dto.PostRequest;
import com.example.exp5.model.Post;
import com.example.exp5.service.PostService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // CREATE POST
    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(
            @Valid @RequestBody PostRequest request) {

        Post post = new Post(
                null,
                request.getTitle(),
                request.getContent(),
                request.getAuthor()
        );

        Post createdPost = postService.createPost(post);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Post created successfully",
                        createdPost
                )
        );
    }

    // GET ALL POSTS
    @GetMapping
    public ResponseEntity<ApiResponse<List<Post>>> getAllPosts() {

        List<Post> posts = postService.getAllPosts();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Posts fetched successfully",
                        posts
                )
        );
    }

    // GET POST BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> getPostById(
            @PathVariable Long id) {

        Post post = postService.getPostById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Post fetched successfully",
                        post
                )
        );
    }

    // UPDATE POST
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {

        Post updatedPost = new Post(
                id,
                request.getTitle(),
                request.getContent(),
                request.getAuthor()
        );

        Post post = postService.updatePost(id, updatedPost);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Post updated successfully",
                        post
                )
        );
    }

    // DELETE POST
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id) {

        postService.deletePost(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Post deleted successfully",
                        null
                )
        );
    }
}