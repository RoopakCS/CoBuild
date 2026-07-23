package com.cobuild.backend.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class FlywayJPAOrderingPostProcessor implements BeanFactoryPostProcessor {

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        if (beanFactory.containsBeanDefinition("entityManagerFactory")) {
            BeanDefinition definition = beanFactory.getBeanDefinition("entityManagerFactory");
            String[] dependsOn = definition.getDependsOn();
            if (dependsOn == null) {
                definition.setDependsOn("flyway");
            } else {
                String[] newDependsOn = Arrays.copyOf(dependsOn, dependsOn.length + 1);
                newDependsOn[dependsOn.length] = "flyway";
                definition.setDependsOn(newDependsOn);
            }
        }
    }
}
