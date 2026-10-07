package com.lingualink.config;

import com.lingualink.entity.Language;
import com.lingualink.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final LanguageRepository languageRepository;

    @Override
    public void run(String... args) {
        seedLanguages();
    }

    private void seedLanguages() {
        List<Language> defaultLanguages = List.of(
            Language.builder().code("en").name("English").flag("🇺🇸").build(),
            Language.builder().code("ta").name("Tamil").flag("🇮🇳").build(),
            Language.builder().code("hi").name("Hindi").flag("🇮🇳").build(),
            Language.builder().code("te").name("Telugu").flag("🇮🇳").build(),
            Language.builder().code("ml").name("Malayalam").flag("🇮🇳").build(),
            Language.builder().code("kn").name("Kannada").flag("🇮🇳").build(),
            Language.builder().code("bn").name("Bengali").flag("🇮🇳").build(),
            Language.builder().code("mr").name("Marathi").flag("🇮🇳").build(),
            Language.builder().code("es").name("Spanish").flag("🇪🇸").build(),
            Language.builder().code("fr").name("French").flag("🇫🇷").build(),
            Language.builder().code("de").name("German").flag("🇩🇪").build(),
            Language.builder().code("ja").name("Japanese").flag("🇯🇵").build(),
            Language.builder().code("ko").name("Korean").flag("🇰🇷").build(),
            Language.builder().code("zh").name("Chinese").flag("🇨🇳").build(),
            Language.builder().code("ar").name("Arabic").flag("🇸🇦").build(),
            Language.builder().code("pt").name("Portuguese").flag("🇧🇷").build(),
            Language.builder().code("ru").name("Russian").flag("🇷🇺").build(),
            Language.builder().code("it").name("Italian").flag("🇮🇹").build()
        );

        for (Language lang : defaultLanguages) {
            if (languageRepository.findByCode(lang.getCode()).isEmpty()) {
                languageRepository.save(lang);
                log.info("Seeded language: {} ({})", lang.getName(), lang.getCode());
            }
        }
    }
}
