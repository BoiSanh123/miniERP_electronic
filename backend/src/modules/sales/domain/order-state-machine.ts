import { ConflictError } from "@shared/domain/errors";

export abstract class OrderState {
  constructor(protected readonly orderContext?: any) {}
  
  abstract getName(): string;
  
  quote(): OrderState {
    throw new ConflictError(`Cannot quote order from state ${this.getName()}`);
  }

  requireApproval(): OrderState {
    throw new ConflictError(`Cannot send to approval from state ${this.getName()}`);
  }

  confirm(): OrderState {
    throw new ConflictError(`Cannot confirm order from state ${this.getName()}`);
  }
  
  ship(): OrderState {
    throw new ConflictError(`Cannot ship order from state ${this.getName()}`);
  }
  
  complete(): OrderState {
    throw new ConflictError(`Cannot complete order from state ${this.getName()}`);
  }

  cancel(): OrderState {
    throw new ConflictError(`Cannot cancel order from state ${this.getName()}`);
  }
}

export class CancelledState extends OrderState {
  getName() { return "CANCELLED"; }
}

export class CompletedState extends OrderState {
  getName() { return "COMPLETED"; }
}

export class PartiallyDeliveredState extends OrderState {
  getName() { return "PARTIALLY_DELIVERED"; }
  
  ship(): OrderState {
    return this; // Vẫn cho phép tiếp tục tạo phiếu xuất kho cho đến khi đủ số lượng
  }

  complete(): OrderState {
    return new CompletedState(this.orderContext);
  }

  cancel(): OrderState {
    return new CancelledState(this.orderContext);
  }
}

export class ConfirmedState extends OrderState {
  getName() { return "CONFIRMED"; }
  
  ship(): OrderState {
    return new PartiallyDeliveredState(this.orderContext);
  }
  
  complete(): OrderState {
    return new CompletedState(this.orderContext);
  }

  cancel(): OrderState {
    return new CancelledState(this.orderContext);
  }
}

export class PendingApprovalState extends OrderState {
  getName() { return "PENDING_APPROVAL"; }
  
  confirm(): OrderState {
    return new ConfirmedState(this.orderContext);
  }
  
  cancel(): OrderState {
    return new CancelledState(this.orderContext);
  }
}

export class QuotedState extends OrderState {
  getName() { return "QUOTED"; }
  
  confirm(): OrderState {
    return new ConfirmedState(this.orderContext);
  }
  
  requireApproval(): OrderState {
    return new PendingApprovalState(this.orderContext);
  }
  
  cancel(): OrderState {
    return new CancelledState(this.orderContext);
  }
}

export class DraftState extends OrderState {
  getName() { return "DRAFT"; }
  
  quote(): OrderState {
    return new QuotedState(this.orderContext);
  }
  
  cancel(): OrderState {
    return new CancelledState(this.orderContext);
  }
}