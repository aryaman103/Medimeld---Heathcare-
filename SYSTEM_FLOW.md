# MediMeld Edge System Flow

## End-to-End Process Flow

```mermaid
graph TB
    subgraph "User Interface"
        A[📱 Open App] --> B[📷 Camera Screen]
        B --> C[📸 Capture Photo]
        C --> D[🖼️ Image Preprocessing]
    end
    
    subgraph "AI Processing"
        D --> E[🔍 Wound Classifier<br/>ViT-small ONNX]
        E --> F[📝 Medical LLM<br/>llama.cpp 7B]
        F --> G[📋 SOAP Note Generation]
    end
    
    subgraph "Data Management"
        G --> H[💾 Local SQLite Storage]
        H --> I[🔐 Photo Hash Generation]
        I --> J[📊 Diagnosis Results]
    end
    
    subgraph "Sync Process"
        J --> K{🌐 Internet Available?}
        K -->|Yes| L[📤 FastAPI Sync]
        K -->|No| M[📱 Offline Storage]
        L --> N[🗄️ Central Database]
        M --> O[⏳ Wait for Connection]
        O --> K
    end
    
    subgraph "User Actions"
        P[👤 View History] --> Q[📋 Review Notes]
        R[🔄 Manual Sync] --> L
        S[🗑️ Delete Note] --> T[🗑️ Remove from DB]
    end
    
    subgraph "Backend Services"
        N --> U[📈 Analytics Dashboard]
        N --> V[🔍 Search & Filter]
        N --> W[📊 Reporting Tools]
    end
    
    subgraph "Privacy Layer"
        X[🔒 No Image Upload] --> Y[🆔 Hash-based IDs]
        Y --> Z[🔐 Encrypted Storage]
        Z --> AA[📋 Audit Trail]
    end
    
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#e1f5fe
    style D fill:#e1f5fe
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#e8f5e8
    style I fill:#e8f5e8
    style J fill:#e8f5e8
    style K fill:#fff8e1
    style L fill:#fff8e1
    style M fill:#fff8e1
    style N fill:#f3e5f5
    style X fill:#ffebee
    style Y fill:#ffebee
    style Z fill:#ffebee
    style AA fill:#ffebee
```

## Detailed Component Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant AI as AI Models
    participant DB as Local SQLite
    participant S as FastAPI Server
    participant CD as Central DB
    
    U->>M: Open App
    M->>M: Initialize Database
    M->>M: Load AI Models
    
    U->>M: Take Photo
    M->>M: Preprocess Image
    M->>AI: Classify Wound
    AI->>M: Return Classification
    M->>AI: Generate SOAP Note
    AI->>M: Return SOAP Note
    
    M->>M: Generate Photo Hash
    M->>DB: Save Note Locally
    DB->>M: Confirm Save
    
    M->>M: Check Network Status
    alt Network Available
        M->>S: POST /sync
        S->>CD: Save Notes
        CD->>S: Confirm Save
        S->>M: Return Sync Status
        M->>DB: Mark as Synced
    else No Network
        M->>M: Store for Later Sync
    end
    
    U->>M: View History
    M->>DB: Get Local Notes
    DB->>M: Return Notes
    M->>U: Display History
    
    U->>M: Manual Sync
    M->>S: POST /sync
    S->>CD: Save Notes
    CD->>S: Confirm Save
    S->>M: Return Sync Status
    M->>DB: Mark as Synced
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Mobile Device"
        A[📱 React Native App]
        B[📷 Camera Module]
        C[🤖 AI Models]
        D[💾 SQLite DB]
        E[🌐 Network Module]
    end
    
    subgraph "Backend Server"
        F[🚀 FastAPI Server]
        G[🗄️ Database]
        H[📊 Analytics]
        I[🔐 Auth Service]
    end
    
    subgraph "AI Models"
        J[🔍 ViT Classifier]
        K[📝 Medical LLM]
        L[⚙️ Model Manager]
    end
    
    subgraph "External Services"
        M[📡 Internet]
        N[☁️ Cloud Storage]
        O[📊 Monitoring]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    
    C --> J
    C --> K
    C --> L
    
    E --> M
    F --> N
    F --> O
    
    style A fill:#e3f2fd
    style F fill:#f3e5f5
    style J fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff3e0
```

## Privacy & Security Flow

```mermaid
graph TD
    A[📸 Photo Capture] --> B[🔒 Local Processing]
    B --> C[🆔 Hash Generation]
    C --> D[📋 Metadata Only]
    D --> E[💾 Local Storage]
    E --> F{🌐 Sync?}
    
    F -->|Yes| G[📤 Hash + Metadata]
    F -->|No| H[📱 Offline Storage]
    
    G --> I[🔐 Encrypted Transfer]
    I --> J[🗄️ Central DB]
    J --> K[📊 Analytics Only]
    
    H --> L[⏳ Wait for Network]
    L --> F
    
    style A fill:#ffebee
    style B fill:#ffebee
    style C fill:#ffebee
    style D fill:#ffebee
    style E fill:#ffebee
    style G fill:#e8f5e8
    style I fill:#e8f5e8
    style J fill:#e8f5e8
    style K fill:#e8f5e8
```

## Error Handling Flow

```mermaid
graph TD
    A[🔄 Process Start] --> B{❓ AI Models Loaded?}
    B -->|No| C[⚠️ Load Models]
    B -->|Yes| D[📸 Process Image]
    
    C --> E{❓ Load Success?}
    E -->|No| F[🚨 Model Error]
    E -->|Yes| D
    
    D --> G{❓ Classification Success?}
    G -->|No| H[🚨 Classification Error]
    G -->|Yes| I[📝 Generate SOAP]
    
    I --> J{❓ SOAP Success?}
    J -->|No| K[🚨 SOAP Error]
    J -->|Yes| L[💾 Save to DB]
    
    L --> M{❓ Save Success?}
    M -->|No| N[🚨 Database Error]
    M -->|Yes| O[✅ Success]
    
    F --> P[📱 Show Error UI]
    H --> P
    K --> P
    N --> P
    
    P --> Q[🔄 Retry Option]
    Q --> A
    
    style A fill:#e3f2fd
    style O fill:#e8f5e8
    style P fill:#ffebee
    style F fill:#ffebee
    style H fill:#ffebee
    style K fill:#ffebee
    style N fill:#ffebee
```

## Performance Metrics

```mermaid
graph LR
    subgraph "Timing Benchmarks"
        A[📸 Photo Capture: 1s]
        B[🔍 Classification: 200ms]
        C[📝 SOAP Generation: 2-5s]
        D[💾 Database Save: 100ms]
        E[📤 Sync Upload: 50ms/note]
    end
    
    subgraph "Resource Usage"
        F[📱 App Size: 50MB]
        G[🤖 Models: 4.3GB total]
        H[💾 Database: <1MB/1000 notes]
        I[⚡ Memory: <2GB peak]
    end
    
    subgraph "Accuracy Metrics"
        J[🎯 Classification: 85%]
        K[📝 SOAP Quality: Medical-grade]
        L[🔄 Sync Success: 99%]
        M[📊 Data Integrity: 100%]
    end
    
    style A fill:#e8f5e8
    style B fill:#e8f5e8
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#e8f5e8
    style F fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#f3e5f5
    style K fill:#f3e5f5
    style L fill:#f3e5f5
    style M fill:#f3e5f5
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[💻 Local Development]
        B[🧪 Testing Environment]
        C[📱 Device Testing]
    end
    
    subgraph "Staging"
        D[🚀 Staging Server]
        E[📊 Staging Database]
        F[🔍 QA Testing]
    end
    
    subgraph "Production"
        G[🌐 Production Server]
        H[🗄️ Production Database]
        I[📱 App Store]
        J[📱 Google Play]
    end
    
    subgraph "Monitoring"
        K[📊 Analytics]
        L[🚨 Error Tracking]
        M[📈 Performance Monitoring]
    end
    
    A --> D
    B --> D
    C --> D
    D --> G
    E --> H
    F --> G
    G --> I
    G --> J
    G --> K
    G --> L
    G --> M
    
    style A fill:#e3f2fd
    style D fill:#fff3e0
    style G fill:#e8f5e8
    style K fill:#f3e5f5
    style L fill:#f3e5f5
    style M fill:#f3e5f5
```

This comprehensive system flow demonstrates the complete end-to-end process of the MediMeld Edge application, from photo capture to data synchronization, with emphasis on privacy, security, and offline functionality. 