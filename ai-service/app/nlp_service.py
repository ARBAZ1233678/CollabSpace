from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
import re
import nltk
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any
import logging

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        self.summarization_pipeline = None
        self.sentiment_pipeline = None
        self.qa_pipeline = None
        self.embedding_model = None
        self._load_models()

    def _load_models(self):
        # Load AI models on service initialization
        try:
            logger.info("Loading NLP models...")

            # Load summarization model
            self.summarization_pipeline = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=0 if torch.cuda.is_available() else -1
            )

            # Load sentiment analysis model
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if torch.cuda.is_available() else -1
            )

            # Load question-answering model
            self.qa_pipeline = pipeline(
                "question-answering",
                model="distilbert-base-cased-distilled-squad",
                device=0 if torch.cuda.is_available() else -1
            )

            # Load sentence transformer for embeddings
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

            logger.info("NLP models loaded successfully")

        except Exception as e:
            logger.error(f"Error loading NLP models: {str(e)}")
            raise

    def summarize_text(self, text: str, max_length: int = 150) -> str:
        # Summarize long text into a concise summary
        try:
            # Handle text that's too short to summarize
            if len(text.split()) < 50:
                return text

            # Split long text into chunks if necessary
            max_chunk_length = 1024  # BART max input length
            chunks = self._split_text_into_chunks(text, max_chunk_length)

            summaries = []
            for chunk in chunks:
                summary = self.summarization_pipeline(
                    chunk,
                    max_length=max_length,
                    min_length=30,
                    do_sample=False
                )
                summaries.append(summary[0]['summary_text'])

            # Combine summaries if multiple chunks
            if len(summaries) > 1:
                combined = " ".join(summaries)
                # Summarize the combined summaries if still too long
                if len(combined.split()) > max_length:
                    final_summary = self.summarization_pipeline(
                        combined,
                        max_length=max_length,
                        min_length=30,
                        do_sample=False
                    )
                    return final_summary[0]['summary_text']
                return combined

            return summaries[0]

        except Exception as e:
            logger.error(f"Text summarization error: {str(e)}")
            return "Error generating summary"

    def extract_action_items(self, text: str) -> List[Dict[str, Any]]:
        # Extract action items from meeting transcripts or documents
        try:
            action_items = []

            # Patterns for action items
            patterns = [
                r"(?i)(?:action item|todo|to do|task|follow up):?\s*(.+?)(?:\n|$)",
                r"(?i)(?:need to|should|will|must)\s+(.+?)(?:\n|\.)",
                r"(?i)@(\w+)\s+(.+?)(?:\n|$)",  # @mention format
                r"(?i)(?:assigned to|responsible:)\s*(\w+)\s*[-:]?\s*(.+?)(?:\n|$)"
            ]

            for i, pattern in enumerate(patterns):
                matches = re.findall(pattern, text)
                for match in matches:
                    if isinstance(match, tuple):
                        if len(match) == 2:
                            action_items.append({
                                'id': len(action_items) + 1,
                                'text': match[1].strip(),
                                'assignee': match[0].strip(),
                                'priority': self._determine_priority(match[1]),
                                'type': 'assigned'
                            })
                        else:
                            action_items.append({
                                'id': len(action_items) + 1,
                                'text': match.strip(),
                                'assignee': None,
                                'priority': self._determine_priority(match),
                                'type': 'general'
                            })
                    else:
                        action_items.append({
                            'id': len(action_items) + 1,
                            'text': match.strip(),
                            'assignee': None,
                            'priority': self._determine_priority(match),
                            'type': 'general'
                        })

            # Remove duplicates and clean up
            unique_items = []
            seen_texts = set()

            for item in action_items:
                text_key = item['text'].lower().strip()
                if text_key not in seen_texts and len(text_key) > 10:
                    seen_texts.add(text_key)
                    unique_items.append(item)

            return unique_items[:10]  # Return top 10 action items

        except Exception as e:
            logger.error(f"Action item extraction error: {str(e)}")
            return []

    def answer_question(self, question: str, context: str) -> str:
        # Answer questions based on provided context
        try:
            result = self.qa_pipeline(question=question, context=context)
            return result['answer']
        except Exception as e:
            logger.error(f"Question answering error: {str(e)}")
            return "Unable to answer the question based on the provided context."

    def get_answer_confidence(self, answer: str) -> float:
        # Get confidence score for an answer
        # Simple heuristic - in production, use the actual model confidence
        if len(answer) > 50:
            return 0.85
        elif len(answer) > 20:
            return 0.70
        else:
            return 0.55

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        # Analyze sentiment of text
        try:
            result = self.sentiment_pipeline(text)
            return {
                'label': result[0]['label'],
                'score': result[0]['score']
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {str(e)}")
            return {'label': 'NEUTRAL', 'score': 0.5}

    def generate_meeting_summary(self, transcript: str, participants: List[str]) -> Dict[str, Any]:
        # Generate comprehensive meeting summary
        try:
            # Basic summary
            summary = self.summarize_text(transcript, max_length=200)

            # Extract action items
            action_items = self.extract_action_items(transcript)

            # Analyze sentiment
            sentiment = self.analyze_sentiment(transcript)

            # Extract key topics (simple keyword extraction)
            key_topics = self._extract_key_topics(transcript)

            # Analyze participation
            participation = self._analyze_simple_participation(transcript, participants)

            return {
                'summary': summary,
                'action_items': action_items,
                'key_topics': key_topics,
                'sentiment': sentiment,
                'participation_analysis': participation,
                'meeting_duration_estimate': len(transcript.split()) * 0.5,  # rough estimate
                'word_count': len(transcript.split())
            }

        except Exception as e:
            logger.error(f"Meeting summary generation error: {str(e)}")
            return {
                'summary': 'Error generating meeting summary',
                'action_items': [],
                'key_topics': [],
                'sentiment': {'label': 'NEUTRAL', 'score': 0.5},
                'participation_analysis': {},
                'meeting_duration_estimate': 0,
                'word_count': 0
            }

    def _split_text_into_chunks(self, text: str, max_length: int) -> List[str]:
        # Split text into chunks for processing
        words = text.split()
        chunks = []
        current_chunk = []

        for word in words:
            if len(' '.join(current_chunk + [word])) <= max_length:
                current_chunk.append(word)
            else:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [word]

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks

    def _determine_priority(self, text: str) -> str:
        # Determine priority level of action items
        urgent_keywords = ['urgent', 'asap', 'immediately', 'critical', 'important']
        high_keywords = ['soon', 'quickly', 'priority', 'deadline']

        text_lower = text.lower()

        if any(keyword in text_lower for keyword in urgent_keywords):
            return 'urgent'
        elif any(keyword in text_lower for keyword in high_keywords):
            return 'high'
        else:
            return 'medium'

    def _extract_key_topics(self, text: str) -> List[str]:
        # Extract key topics from text
        try:
            from collections import Counter
            import string

            # Simple keyword extraction
            stop_words = set(nltk.corpus.stopwords.words('english'))

            # Clean and tokenize
            translator = str.maketrans('', '', string.punctuation)
            clean_text = text.translate(translator).lower()
            words = [word for word in clean_text.split() if word not in stop_words and len(word) > 3]

            # Get most common words
            word_counts = Counter(words)
            return [word for word, count in word_counts.most_common(10)]

        except Exception as e:
            logger.error(f"Topic extraction error: {str(e)}")
            return []

    def _analyze_simple_participation(self, transcript: str, participants: List[str]) -> Dict[str, Any]:
        # Simple participation analysis
        try:
            participation = {}

            for participant in participants:
                # Count mentions of participant name
                mentions = len(re.findall(rf'\b{re.escape(participant)}\b', transcript, re.IGNORECASE))
                participation[participant] = {
                    'mentions': mentions,
                    'estimated_speaking_time': mentions * 5  # rough estimate in seconds
                }

            return participation

        except Exception as e:
            logger.error(f"Participation analysis error: {str(e)}")
            return {}

# Create global instance
nlp_service = NLPService()
