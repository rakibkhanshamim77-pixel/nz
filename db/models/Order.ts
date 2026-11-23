import mongoose, { Schema, Model, Document, Types } from "mongoose";

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface IOrderActivity {
  _id?: Types.ObjectId;
  type: string;
  title: string;
  description?: string;
  status?: string;
  performedBy?: Types.ObjectId;
  performedByRole: "admin" | "customer" | "system";
  isInternal: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

const ActivitySchema = new Schema<IOrderActivity>(
  {
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    performedByRole: {
      type: String,
      enum: ["admin", "customer", "system"],
      default: "system",
    },
    isInternal: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: true },
);

// ─── Order Item ───────────────────────────────────────────────────────────────

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    sku: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    colorHex: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface IOrderPayment {
  method: "cod" | "online";
  status:
    | "pending"
    | "processing"
    | "paid"
    | "partially_paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  amount: number;
  paidAmount: number;
  dueAmount: number;
  transactionId?: string;
  gateway?: string;
  paidAt?: Date;
  instructions?: string;
  senderAccount?: string;
  screenshotUrl?: string;
  screenshotDisplayUrl?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  rejectionReason?: string;
}

const PaymentSchema = new Schema<IOrderPayment>(
  {
    method: { type: String, enum: ["cod", "online"], required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "partially_paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
    },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    transactionId: { type: String, trim: true },
    gateway: { type: String, trim: true },
    paidAt: { type: Date },
    instructions: { type: String, trim: true },
    senderAccount: { type: String, trim: true },
    screenshotUrl: { type: String, trim: true },
    screenshotDisplayUrl: { type: String, trim: true },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String, trim: true },
  },
  { _id: false },
);

// ─── Delivery ─────────────────────────────────────────────────────────────────

export interface IOrderDelivery {
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingStatus?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryAt?: Date;
}

const DeliverySchema = new Schema<IOrderDelivery>(
  {
    courier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    trackingUrl: { type: String, trim: true },
    shippingStatus: { type: String, trim: true },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    estimatedDeliveryAt: { type: Date },
  },
  { _id: false },
);

// ─── Customer Snapshot ────────────────────────────────────────────────────────

export interface IOrderCustomer {
  name: string;
  phone: string;
  email?: string;
  division?: string;
  district: string;
  upazila?: string;
  address: string;
}

const CustomerSnapshotSchema = new Schema<IOrderCustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    division: { type: String, trim: true },
    district: { type: String, required: true, trim: true },
    upazila: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { _id: false },
);

// ─── Order ────────────────────────────────────────────────────────────────────

export interface IOrder {
  orderNumber: string;
  user?: Types.ObjectId;
  customerType: "guest" | "registered";
  customer: IOrderCustomer;
  items: IOrderItem[];
  note?: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  paymentAmount: number;
  dueAmount: number;
  currency: string;
  payment: IOrderPayment;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned"
    | "refunded";
  delivery: IOrderDelivery;
  activities: IOrderActivity[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {}

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    customerType: {
      type: String,
      enum: ["guest", "registered"],
      required: true,
    },
    customer: { type: CustomerSnapshotSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    note: { type: String, trim: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentAmount: { type: Number, required: true, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    payment: { type: PaymentSchema, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "pending",
    },
    delivery: { type: DeliverySchema, default: {} },
    activities: { type: [ActivitySchema], default: [] },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// orderNumber index is already created by unique: true above.
// Do not declare it again.
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ "payment.status": 1 });
OrderSchema.index({ "customer.phone": 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

export default Order;
