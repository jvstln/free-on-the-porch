import { env } from "@free-on-the-porch/env/server";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { corsConfig } from "./common/constants";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("api/v1");
	app.enableCors(corsConfig);

	// Swagger
	const config = new DocumentBuilder()
		.setTitle("Free on the Porch API")
		.setDescription("API for the Free on the Porch mobile app")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document);

	await app.listen(env.PORT ?? 3000);
}

bootstrap();
