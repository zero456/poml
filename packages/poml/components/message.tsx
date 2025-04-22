import { component, ContentMultiMedia, RichContent } from 'poml/base';
import { Text, Image } from 'poml/essentials';
import * as React from 'react';
import { Message } from 'poml/base';
import { parsePythonStyleSlice } from './utils';

/**
 * Wrap the contents in a system message.
 *
 * @see {@link Text} for other props available.
 *
 * @example
 * ```xml
 * <system-msg>Answer concisely.</system-msg>
 * ```
 */
export const SystemMessage = component('SystemMessage', ['system-msg'])((
  props: React.PropsWithChildren
) => {
  const { children, ...others } = props;
  return (
    <Text speaker="system" {...others}>
      {children}
    </Text>
  );
});

/**
 * Wrap the contents in a user message.
 *
 * @see {@link Text} for other props available.
 *
 * @example
 * ```xml
 * <user-msg>What is the capital of France?</user-msg>
 * ```
 */
export const HumanMessage = component('HumanMessage', ['human-msg'])((
  props: React.PropsWithChildren
) => {
  const { children, ...others } = props;
  return (
    <Text speaker="human" {...others}>
      {children}
    </Text>
  );
});

/**
 * Wrap the contents in a AI message.
 *
 * @see {@link Text} for other props available.
 *
 * @example
 * ```xml
 * <ai-msg>Paris</ai-msg>
 * ```
 */
export const AiMessage = component('AiMessage', ['ai-msg'])((props: React.PropsWithChildren) => {
  const { children, ...others } = props;
  return (
    <Text speaker="ai" {...others}>
      {children}
    </Text>
  );
});

interface MessageContentProps {
  content: RichContent;
}

/**
 * Display a message content.
 * 
 * @param {object|string} content - The content of the message. It can be a string, or an array of strings and multimedia content.
 * 
 * @example
 * ```xml
 * <msg-content content="What is the capital of France?" />
 * ```
 */
export const MessageContent = component('MessageContent', ['msg-content'])((
  props: React.PropsWithChildren<MessageContentProps>
) => {
  const { children, content, ...others } = props;

  const displayStringOrMultimedia = (media: ContentMultiMedia | string, key?: string) => {
    if (typeof media === 'string') {
      return (
        <Text key={key} {...others}>
          {media}
        </Text>
      );
    } else if (media.type.startsWith('image/')) {
      return (
        <Image key={key} base64={media.base64} alt={media.alt} type={media.type} {...others} />
      );
    } else {
      throw new Error(`Unsupported media type: ${media.type}`);
    }
  };

  if (typeof content === 'string') {
    return displayStringOrMultimedia(content);
  } else if (Array.isArray(content)) {
    return <>{content.map((item, index) => displayStringOrMultimedia(item, `content-${index}`))}</>;
  }
});

interface ConversationProps {
  messages: Message[];
  selectedMessages?: string;
}

/**
 * Display a conversation between system, human and AI.
 *
 * @param {object} messages - A list of message. Each message should have a `speaker` and a `content` field.
 * @param {string} selectedMessages - The messages to be selected. If not provided, all messages will be selected.
 * You can use a string like `2` to specify a single message, or slice like `2:4` to specify a range of messages (2 inclusive, 4 exclusive).
 * Or use `-6:` to select the last 6 messages.
 *
 * @example
 * ```xml
 * <conversation messages="{{[{ speaker: 'human', content: 'What is the capital of France?' }, { speaker: 'ai', content: 'Paris' }]}}" />
 * ```
 */
export const Conversation = component('Conversation', ['conversation'])((
  props: React.PropsWithChildren<ConversationProps>
) => {
  let { children, messages, selectedMessages, ...others } = props;
  if (selectedMessages) {
    const [start, end] = parsePythonStyleSlice(selectedMessages, messages.length);
    messages = messages.slice(start, end);
  }
  return (
    <>
      {messages.map((message, index) => (
        <Text key={`message-${index}`} speaker={message.speaker} {...others}>
          <MessageContent content={message.content} {...others} />
        </Text>
      ))}
    </>
  );
});
