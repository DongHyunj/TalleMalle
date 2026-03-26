package org.example.tallemalle_backend.common.exception;

import lombok.Getter;
import org.example.tallemalle_backend.common.model.BaseResponseStatus;

@Getter
public class BaseException extends RuntimeException{
    private BaseResponseStatus status;

    public BaseException(BaseResponseStatus status){
        super(status.getMessage());
        this.status = status;
    }

    public static BaseException from(BaseResponseStatus status){
        return new BaseException(status);
    }
}
