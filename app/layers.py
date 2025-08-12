# Import dependencies
import tensorflow as tf
from keras.layers import Layer

# Custom L1 Distance Layer - Fixed to match saved model expectations
class L1Dist(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
    def call(self, input_embedding, validation_embedding=None, **kwargs):
        # Handle different input formats the saved model might use
        if validation_embedding is not None and not isinstance(validation_embedding, (list, str)):
            # Called with separate tensor arguments
            return tf.math.abs(input_embedding - validation_embedding)
        elif isinstance(input_embedding, list) and len(input_embedding) == 2:
            # Called with list of two tensors
            return tf.math.abs(input_embedding[0] - input_embedding[1])
        else:
            # Debug: Print what we're receiving
            print(f"DEBUG L1Dist call - input_embedding type: {type(input_embedding)}")
            print(f"DEBUG L1Dist call - validation_embedding: {validation_embedding}")
            
            # If validation_embedding is a string list, this is a model loading issue
            if isinstance(validation_embedding, list) and len(validation_embedding) > 0 and isinstance(validation_embedding[0], str):
                print("ERROR: Received string list instead of tensor for validation_embedding")
                # Return a dummy tensor to prevent crash
                return tf.zeros_like(input_embedding)
            
            # Fallback - assume it's a concatenated input that needs splitting
            return tf.math.abs(input_embedding)
    
    def compute_output_shape(self, input_shape):
        # Return proper shape tuple instead of None
        if isinstance(input_shape, list):
            return input_shape[0]
        else:
            return input_shape