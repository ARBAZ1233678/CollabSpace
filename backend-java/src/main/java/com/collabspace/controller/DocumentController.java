package com.collabspace.controller;

import com.collabspace.dto.DocumentDTO;
import com.collabspace.service.AuthService;
import com.collabspace.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@Tag(name = "Documents", description = "Document management endpoints")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private AuthService authService;

    @GetMapping("/team/{teamId}")
    @Operation(summary = "Get team documents", description = "Get all documents for a specific team")
    public ResponseEntity<?> getTeamDocuments(
            @PathVariable Long teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            Page<DocumentDTO> documents = documentService.getTeamDocuments(teamId, userId, PageRequest.of(page, size), search);
            return ResponseEntity.ok(Map.of(
                "documents", documents.getContent(),
                "totalElements", documents.getTotalElements(),
                "totalPages", documents.getTotalPages(),
                "currentPage", page
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get documents: " + e.getMessage()));
        }
    }

    @PostMapping
    @Operation(summary = "Create document", description = "Create a new document")
    public ResponseEntity<?> createDocument(@RequestBody @Valid DocumentDTO documentDTO, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            DocumentDTO createdDocument = documentService.createDocument(documentDTO, userId);
            return ResponseEntity.ok(createdDocument);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create document: " + e.getMessage()));
        }
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Get document", description = "Get a specific document by ID")
    public ResponseEntity<?> getDocument(@PathVariable Long documentId, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            DocumentDTO document = documentService.getDocument(documentId, userId);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get document: " + e.getMessage()));
        }
    }

    @PutMapping("/{documentId}")
    @Operation(summary = "Update document", description = "Update document content and metadata")
    public ResponseEntity<?> updateDocument(
            @PathVariable Long documentId, 
            @RequestBody @Valid DocumentDTO documentDTO, 
            HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            DocumentDTO updatedDocument = documentService.updateDocument(documentId, documentDTO, userId);
            return ResponseEntity.ok(updatedDocument);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update document: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Delete document", description = "Delete a document")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            documentService.deleteDocument(documentId, userId);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete document: " + e.getMessage()));
        }
    }

    @PostMapping("/{documentId}/lock")
    @Operation(summary = "Lock document", description = "Lock document for editing")
    public ResponseEntity<?> lockDocument(@PathVariable Long documentId, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            documentService.lockDocument(documentId, userId);
            return ResponseEntity.ok(Map.of("message", "Document locked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to lock document: " + e.getMessage()));
        }
    }

    @PostMapping("/{documentId}/unlock")
    @Operation(summary = "Unlock document", description = "Unlock document after editing")
    public ResponseEntity<?> unlockDocument(@PathVariable Long documentId, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            documentService.unlockDocument(documentId, userId);
            return ResponseEntity.ok(Map.of("message", "Document unlocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to unlock document: " + e.getMessage()));
        }
    }

    @PostMapping("/{documentId}/export-google-docs")
    @Operation(summary = "Export to Google Docs", description = "Export document to Google Drive as Google Docs")
    public ResponseEntity<?> exportToGoogleDocs(@PathVariable Long documentId, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            String googleDocsUrl = documentService.exportToGoogleDocs(documentId, userId);
            return ResponseEntity.ok(Map.of("googleDocsUrl", googleDocsUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to export to Google Docs: " + e.getMessage()));
        }
    }

    @GetMapping("/{documentId}/collaborators")
    @Operation(summary = "Get document collaborators", description = "Get list of users currently editing the document")
    public ResponseEntity<?> getDocumentCollaborators(@PathVariable Long documentId, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            List<Map<String, Object>> collaborators = documentService.getActiveCollaborators(documentId, userId);
            return ResponseEntity.ok(Map.of("collaborators", collaborators));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get collaborators: " + e.getMessage()));
        }
    }
}
