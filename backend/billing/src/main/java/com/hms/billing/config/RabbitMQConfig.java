package com.hms.billing.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  public static final String BILLING_PHARMACY_QUEUE = "billing.pharmacy.sale.queue";
  public static final String PHARMACY_SALE_ROUTING_KEY = "pharmacy.sale.created";

  @Value("${application.rabbitmq.queues.appointment-billing}")
  private String billingQueue;

  @Value("${application.rabbitmq.exchanges.internal}")
  private String internalExchange;

  @Value("${application.rabbitmq.routing-keys.appointment-completed}")
  private String appointmentCompletedRoutingKey;

  public static final String SAGA_APPOINTMENT_STARTED_QUEUE = "billing.saga.appointment.started.queue";
  public static final String SAGA_APPOINTMENT_COMPENSATED_QUEUE = "billing.saga.appointment.compensated.queue";
  public static final String SAGA_STARTED_ROUTING_KEY = "appointment.saga.started";
  public static final String SAGA_COMPENSATED_ROUTING_KEY = "appointment.saga.compensated";

  @Bean
  public Queue billingQueue() {
    return new Queue(billingQueue);
  }

  @Bean
  public TopicExchange internalExchange() {
    return new TopicExchange(internalExchange);
  }

  @Bean
  public Binding billingBinding() {
    return BindingBuilder
      .bind(billingQueue())
      .to(internalExchange())
      .with(appointmentCompletedRoutingKey);
  }

  @Bean
  public MessageConverter converter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public Queue billingPharmacyQueue() {
    return new Queue(BILLING_PHARMACY_QUEUE, true);
  }
  
  @Bean
  public Queue sagaAppointmentStartedQueue() {
    return new Queue(SAGA_APPOINTMENT_STARTED_QUEUE, true);
  }

  @Bean
  public Queue sagaAppointmentCompensatedQueue() {
    return new Queue(SAGA_APPOINTMENT_COMPENSATED_QUEUE, true);
  }

  @Bean
  public Binding sagaAppointmentStartedBinding() {
    return BindingBuilder.bind(sagaAppointmentStartedQueue())
      .to(internalExchange())
      .with(SAGA_STARTED_ROUTING_KEY);
  }

  @Bean
  public Binding sagaAppointmentCompensatedBinding() {
    return BindingBuilder.bind(sagaAppointmentCompensatedQueue())
      .to(internalExchange())
      .with(SAGA_COMPENSATED_ROUTING_KEY);
  }

  @Bean
  public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
    RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(converter());
    return rabbitTemplate;
  }

  @Bean
  public Binding pharmacySaleBinding(Queue billingPharmacyQueue, TopicExchange exchange) {
    return BindingBuilder.bind(billingPharmacyQueue)
      .to(exchange)
      .with(PHARMACY_SALE_ROUTING_KEY);
  }
}