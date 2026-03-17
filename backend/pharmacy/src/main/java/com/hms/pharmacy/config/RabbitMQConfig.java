package com.hms.pharmacy.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  public static final String PRESCRIPTION_QUEUE = "pharmacy.prescription.sync.queue";
  public static final String PRESCRIPTION_ROUTING_KEY = "prescription.issued";
  public static final String PATIENT_SYNC_QUEUE = "pharmacy.patient.sync.queue";
  public static final String USER_SYNC_QUEUE = "pharmacy.user.sync.queue";
  public static final String STOCK_LOW_QUEUE = "notification.stock.low.queue";
  public static final String STOCK_LOW_ROUTING_KEY = "stock.low";

  public static final String SAGA_PHARMACY_STARTED_QUEUE = "pharmacy.saga.appointment.started.queue";
  public static final String SAGA_PHARMACY_COMPENSATED_QUEUE = "pharmacy.saga.appointment.compensated.queue";
  public static final String SAGA_STARTED_ROUTING_KEY = "appointment.saga.started";
  public static final String SAGA_COMPENSATED_ROUTING_KEY = "appointment.saga.compensated";

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(exchange);
  }

  @Bean
  public Queue prescriptionQueue() {
    return new Queue(PRESCRIPTION_QUEUE, true);
  }

  @Bean
  public Binding prescriptionBinding() {
    return BindingBuilder.bind(prescriptionQueue()).to(exchange()).with(PRESCRIPTION_ROUTING_KEY);
  }

  @Bean
  public Queue patientSyncQueue() {
    return new Queue(PATIENT_SYNC_QUEUE, true);
  }

  @Bean
  public Binding patientBinding() {
    return BindingBuilder.bind(patientSyncQueue()).to(exchange()).with("patient.*");
  }

  @Bean
  public Queue userSyncQueue() {
    return new Queue(USER_SYNC_QUEUE, true);
  }

  @Bean
  public Binding userBinding() {
    return BindingBuilder.bind(userSyncQueue()).to(exchange()).with("user.event.created");
  }

  @Bean
  public Queue stockLowQueue() {
    return new Queue(STOCK_LOW_QUEUE, true);
  }

  @Bean
  public Binding stockLowBinding() {
    return BindingBuilder.bind(stockLowQueue()).to(exchange()).with(STOCK_LOW_ROUTING_KEY);
  }

  @Bean
  public Queue sagaPharmacyStartedQueue() {
    return new Queue(SAGA_PHARMACY_STARTED_QUEUE, true);
  }

  @Bean
  public Queue sagaPharmacyCompensatedQueue() {
    return new Queue(SAGA_PHARMACY_COMPENSATED_QUEUE, true);
  }

  @Bean
  public Binding sagaPharmacyStartedBinding() {
    return BindingBuilder.bind(sagaPharmacyStartedQueue())
      .to(exchange())
      .with(SAGA_STARTED_ROUTING_KEY);
  }

  @Bean
  public Binding sagaPharmacyCompensatedBinding() {
    return BindingBuilder.bind(sagaPharmacyCompensatedQueue())
      .to(exchange())
      .with(SAGA_COMPENSATED_ROUTING_KEY);
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
    RabbitTemplate template = new RabbitTemplate(connectionFactory);
    template.setMessageConverter(jsonMessageConverter());
    return template;
  }
}