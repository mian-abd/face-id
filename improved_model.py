# Improved Siamese Face Recognition Model
import tensorflow as tf
from keras.models import Model
from keras.layers import Layer, Conv2D, Dense, MaxPooling2D, Input, Flatten
from keras.layers import BatchNormalization, Dropout, GlobalAveragePooling2D
from keras.optimizers import Adam
from keras.losses import BinaryCrossentropy
from keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import numpy as np
import cv2
import os

# Improved L1 Distance Layer
@tf.keras.utils.register_keras_serializable()
class L1Dist(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
    def call(self, input_embedding, validation_embedding):
        return tf.math.abs(tf.math.subtract(input_embedding, validation_embedding))

# Modern CNN Embedding Network
def make_improved_embedding():
    inp = Input(shape=(100, 100, 3), name='input_img')
    
    # Block 1 - Initial feature extraction
    c1 = Conv2D(32, (3, 3), activation='relu', padding='same')(inp)
    c1 = BatchNormalization()(c1)
    c1 = Conv2D(32, (3, 3), activation='relu', padding='same')(c1)
    c1 = BatchNormalization()(c1)
    p1 = MaxPooling2D((2, 2))(c1)  # 50x50
    p1 = Dropout(0.2)(p1)
    
    # Block 2 - Enhanced features
    c2 = Conv2D(64, (3, 3), activation='relu', padding='same')(p1)
    c2 = BatchNormalization()(c2)
    c2 = Conv2D(64, (3, 3), activation='relu', padding='same')(c2)
    c2 = BatchNormalization()(c2)
    p2 = MaxPooling2D((2, 2))(c2)  # 25x25
    p2 = Dropout(0.2)(p2)
    
    # Block 3 - Complex patterns
    c3 = Conv2D(128, (3, 3), activation='relu', padding='same')(p2)
    c3 = BatchNormalization()(c3)
    c3 = Conv2D(128, (3, 3), activation='relu', padding='same')(c3)
    c3 = BatchNormalization()(c3)
    p3 = MaxPooling2D((2, 2))(c3)  # 12x12
    p3 = Dropout(0.3)(p3)
    
    # Block 4 - High-level features
    c4 = Conv2D(256, (3, 3), activation='relu', padding='same')(p3)
    c4 = BatchNormalization()(c4)
    c4 = Conv2D(256, (3, 3), activation='relu', padding='same')(c4)
    c4 = BatchNormalization()(c4)
    p4 = MaxPooling2D((2, 2))(c4)  # 6x6
    p4 = Dropout(0.3)(p4)
    
    # Block 5 - Deep features
    c5 = Conv2D(512, (3, 3), activation='relu', padding='same')(p4)
    c5 = BatchNormalization()(c5)
    c5 = Conv2D(512, (3, 3), activation='relu', padding='same')(c5)
    c5 = BatchNormalization()(c5)
    
    # Global pooling and dense layers
    gap = GlobalAveragePooling2D()(c5)
    gap = Dropout(0.5)(gap)
    
    # Feature embedding
    d1 = Dense(1024, activation='relu')(gap)
    d1 = BatchNormalization()(d1)
    d1 = Dropout(0.5)(d1)
    
    d2 = Dense(512, activation='relu')(d1)
    d2 = BatchNormalization()(d2)
    d2 = Dropout(0.3)(d2)
    
    # Final embedding layer - L2 normalized
    embedding = Dense(256, activation=None)(d2)
    embedding = tf.nn.l2_normalize(embedding, axis=1)
    
    return Model(inputs=[inp], outputs=[embedding], name='improved_embedding')

# Improved Siamese Network
def make_improved_siamese_model():
    # Anchor and positive/negative inputs
    left_input = Input((100, 100, 3))
    right_input = Input((100, 100, 3))
    
    # Shared embedding network
    embedding_network = make_improved_embedding()
    
    # Generate embeddings
    encoded_l = embedding_network(left_input)
    encoded_r = embedding_network(right_input)
    
    # L1 distance layer
    distance_layer = L1Dist()
    distance = distance_layer(encoded_l, encoded_r)
    
    # Classification layer with better architecture
    classifier = Dense(128, activation='relu')(distance)
    classifier = BatchNormalization()(classifier)
    classifier = Dropout(0.2)(classifier)
    classifier = Dense(64, activation='relu')(classifier)
    classifier = Dropout(0.2)(classifier)
    classifier = Dense(1, activation='sigmoid')(classifier)
    
    return Model(inputs=[left_input, right_input], outputs=[classifier], name='improved_siamese')

# Data Augmentation
def augment_image(image):
    """Apply random augmentations to improve robustness"""
    # Random rotation (-15 to 15 degrees)
    angle = np.random.uniform(-15, 15)
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    image = cv2.warpAffine(image, matrix, (w, h))
    
    # Random brightness
    brightness = np.random.uniform(0.8, 1.2)
    image = cv2.convertScaleAbs(image, alpha=brightness, beta=0)
    
    # Random horizontal flip
    if np.random.random() > 0.5:
        image = cv2.flip(image, 1)
    
    # Random noise
    noise = np.random.normal(0, 5, image.shape)
    image = np.clip(image + noise, 0, 255).astype(np.uint8)
    
    return image

# Improved preprocessing
def preprocess_improved(file_path, augment=False):
    """Improved preprocessing with optional augmentation"""
    # Read image
    if isinstance(file_path, str):
        byte_img = tf.io.read_file(file_path)
        img = tf.io.decode_jpeg(byte_img)
    else:
        img = file_path
    
    # Resize to 100x100
    img = tf.image.resize(img, (100, 100))
    
    # Convert to numpy for augmentation
    if augment:
        img_np = img.numpy().astype(np.uint8)
        img_np = augment_image(img_np)
        img = tf.constant(img_np, dtype=tf.float32)
    
    # Normalize to [-1, 1] range (better than [0, 1])
    img = (img / 127.5) - 1.0
    
    return img

# Focal Loss for better hard example mining
class FocalLoss(tf.keras.losses.Loss):
    def __init__(self, alpha=0.25, gamma=2.0, **kwargs):
        super().__init__(**kwargs)
        self.alpha = alpha
        self.gamma = gamma
    
    def call(self, y_true, y_pred):
        # Clip predictions to prevent NaN
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
        
        # Calculate focal loss
        ce_loss = -y_true * tf.math.log(y_pred) - (1 - y_true) * tf.math.log(1 - y_pred)
        p_t = y_true * y_pred + (1 - y_true) * (1 - y_pred)
        alpha_t = y_true * self.alpha + (1 - y_true) * (1 - self.alpha)
        focal_loss = alpha_t * tf.pow(1 - p_t, self.gamma) * ce_loss
        
        return tf.reduce_mean(focal_loss)

# Training function with improved configuration
def train_improved_model(train_data, validation_data=None, epochs=100):
    """Train the improved model with better configuration"""
    
    # Create improved model
    model = make_improved_siamese_model()
    
    # Compile with better optimizer and loss
    model.compile(
        optimizer=Adam(learning_rate=0.001, beta_1=0.9, beta_2=0.999),
        loss=FocalLoss(alpha=0.25, gamma=2.0),
        metrics=['accuracy', 'precision', 'recall']
    )
    
    # Callbacks for better training
    callbacks = [
        ModelCheckpoint(
            'improved_siamese_model.h5',
            monitor='val_loss' if validation_data else 'loss',
            save_best_only=True,
            save_weights_only=False,
            mode='min'
        ),
        ReduceLROnPlateau(
            monitor='val_loss' if validation_data else 'loss',
            factor=0.5,
            patience=10,
            min_lr=1e-7,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss' if validation_data else 'loss',
            patience=20,
            restore_best_weights=True,
            verbose=1
        )
    ]
    
    # Train model
    history = model.fit(
        train_data,
        validation_data=validation_data,
        epochs=epochs,
        callbacks=callbacks,
        verbose=1
    )
    
    return model, history

if __name__ == "__main__":
    print("Improved Siamese Face Recognition Model")
    print("=====================================")
    
    # Create and display model
    model = make_improved_siamese_model()
    model.summary()
    
    print(f"\nModel has {model.count_params():,} parameters")
    print("Ready for training with improved architecture!")
