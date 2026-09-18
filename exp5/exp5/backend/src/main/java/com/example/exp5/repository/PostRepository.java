package com.example.exp5.repository;

import com.example.exp5.model.Post;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class PostRepository {

    private final List<Post> posts = new ArrayList<>();

    private Long nextId = 1L;

    // Create
    public Post save(Post post) {
        post.setId(nextId++);
        posts.add(post);
        return post;
    }

    // Get all posts
    public List<Post> findAll() {
        return posts;
    }

    // Get post by ID
    public Optional<Post> findById(Long id) {
        return posts.stream()
                .filter(post -> post.getId().equals(id))
                .findFirst();
    }

    // Delete post
    public boolean deleteById(Long id) {
        return posts.removeIf(post -> post.getId().equals(id));
    }
}