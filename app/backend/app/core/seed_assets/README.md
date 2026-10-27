# Imagens da carga de teste

Imagens geradas com a ferramenta integrada `image_gen`, pela habilidade `imagegen`. Os JPEGs de 768 × 768 são versionados e copiados para a pasta `media` pelo comando `popular_banco`.

As seis fotos desta pasta representam os estabelecimentos e são copiadas para `media/logotipos/demo`. A subpasta `produtos/` contém 24 fotos individuais, uma para cada produto, copiadas para `media/produtos/demo`. As fotos dos produtos têm arquivos e conteúdos diferentes, inclusive para os itens pausados.

Os prompts finais e o mapeamento entre cada produto e seu arquivo estão em [prompts-produtos.json](prompts-produtos.json).

Os comprovantes são documentos fictícios renderizados com Pillow durante a carga, com os dados correspondentes a cada ticket e a indicação “SEM VALOR FISCAL”.

## Prompts dos estabelecimentos

Cada imagem foi criada com o prompt abaixo, substituindo `{subject}` pelo texto da lista seguinte:

```text
Use case: product-mockup. Asset type: representative category food photo for a fictional food business in a database demo. Subject: {subject}. Natural appetizing food photography, warm soft daylight, neutral cream tabletop, no people, no branding, no lettering, no watermark. Square composition with all food centered, usable as a small catalog thumbnail and business cover. Save the resulting image locally if supported.
```

- `padaria.jpg`: Brazilian bakery breakfast: basket of small pão de queijo cheese breads, a slice of carrot cake with chocolate icing, and a cup of espresso
- `restaurante.jpg`: Brazilian home style lunch: white rice, black beans, grilled chicken, green salad, and a small caramel flan on the side
- `pizzaria.jpg`: An artisanal margherita pizza with mozzarella tomato and basil, sliced on a round wooden board
- `hamburgueria.jpg`: A classic beef cheeseburger with lettuce tomato cheddar and golden french fries
- `cafeteria.jpg`: A ceramic cup of cappuccino with latte art and a flaky butter croissant
- `sorveteria.jpg`: A clear bowl of purple Brazilian açaí topped with sliced banana strawberries and granola beside two scoops of ice cream
