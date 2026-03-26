package org.example.tallemalle_backend.common.model;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Date;

@MappedSuperclass // 상속받아간 변수도 DB 테이블에 적용
@EntityListeners(AuditingEntityListener.class) // 엔티티 변화를 감시하는 리스너 @PrePersist, @preUpdate 같은 특성 시점을 감지하기 위해 사용
@Getter
public class BaseEntity {
    @Column(name="create_date", updatable = false, nullable = false)
    private Date createdAt;

    @Column(name="update_date", nullable = false)
    private Date updatedAt;

    @PrePersist
    void createdAt(){
        this.createdAt = Timestamp.from(Instant.now());
        this.updatedAt = Timestamp.from(Instant.now());
    }

    @PreUpdate
    void updatedAt(){
        this.updatedAt = Timestamp.from(Instant.now());
    }
}
