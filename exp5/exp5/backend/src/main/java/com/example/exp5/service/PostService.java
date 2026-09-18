package com.example.exp5.service;

import com.example.exp5.exception.PostNotFoundException;
import com.example.exp5.model.Post;
import com.example.exp5.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // Create post
    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    // Get all posts
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // Get post by ID
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() ->
                        new PostNotFoundException(
                                "Post not found with id: " + id
                        ));
    }

    // Update post
    public Post updatePost(Long id, Post updatedPost) {

        Post existingPost = getPostById(id);

        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setAuthor(updatedPost.getAuthor());

        return existingPost;
    }

    // Delete post
    public void deletePost(Long id) {

        boolean deleted = postRepository.deleteById(id);

        if (!deleted) {
            throw new PostNotFoundException(
                    "Post not found with id: " + id
            );
        }
    }
}

